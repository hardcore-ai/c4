/**
 * EC2 instancia de desarrollo (bastion / dev box)
 *
 * Instancia t3.micro con Amazon Linux 2023, acceso SSH vía key pair.
 * Vive en la primera subnet pública para acceso directo.
 *
 * Best practices aplicadas:
 *   - AMI: latest Amazon Linux 2023 (data source · siempre actual)
 *   - Instance type burstable: t3.micro
 *   - EBS gp3 encriptado · root volume 8 GB
 *   - SG con SSH restringido a CIDR variable (no abrir 22 al mundo en prod)
 *   - IMDSv2 obligatorio (http_tokens = "required")
 *
 * SSH: ssh -i keys/asistente-ia-dev ec2-user@<public_ip>
 */

# ─── Data source: AMI más reciente de Amazon Linux 2023 ───────────────────────

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

# ─── Key pair: registra la pública generada localmente ────────────────────────

resource "aws_key_pair" "instancia_dev" {
  key_name   = "${local.nombre_base}-key"
  public_key = var.ssh_public_key

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-key"
  })
}

# ─── Security Group: SSH al bastion ───────────────────────────────────────────

resource "aws_security_group" "ssh_bastion" {
  name        = "${local.nombre_base}-sg-ssh"
  description = "Permite SSH al bastion desde CIDR autorizado"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH desde CIDR autorizado"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  egress {
    description = "Trafico saliente - patches, package manager"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-sg-ssh"
  })
}

# ─── EC2 Instance: t3.micro / Amazon Linux 2023 ───────────────────────────────

resource "aws_instance" "dev" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = var.ec2_instance_type
  subnet_id                   = var.ids_subnets_publicas[0]
  vpc_security_group_ids      = [aws_security_group.ssh_bastion.id]
  key_name                    = aws_key_pair.instancia_dev.key_name
  associate_public_ip_address = true

  # IMDSv2 obligatorio — bloquea SSRF que podría leer credenciales de la instancia
  metadata_options {
    http_tokens                 = "required"
    http_endpoint               = "enabled"
    http_put_response_hop_limit = 1
  }

  # Disco root encriptado · gp3
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 8
    encrypted             = true
    delete_on_termination = true

    tags = merge(local.tags_comunes, {
      Name = "${local.nombre_base}-ec2-root"
    })
  }

  user_data = <<-EOF
              #!/bin/bash
              set -eux
              dnf update -y
              echo "asistente-ia dev bastion · $(date -Is)" > /etc/motd
              EOF

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-ec2-dev"
    Role = "bastion"
  })
}
