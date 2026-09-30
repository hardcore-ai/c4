export interface ScoreCriteria {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
}

export interface Competency {
  competencyId: string;
  name: string;
  description: string;
  weight: number;
  sampleQuestion: string;
  criteria: ScoreCriteria;
}

export interface Rubric {
  rubricId: string;
  tenantId: string;
  name: string;
  template: 'bpo' | 'tech';
  competencies: Competency[];
  createdAt: string;
}
