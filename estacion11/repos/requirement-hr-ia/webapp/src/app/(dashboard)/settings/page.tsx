import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6" data-testid="settings-page">
      <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
      <Card>
        <CardHeader>
          <CardTitle>Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            La configuración de cuenta estará disponible en una versión futura.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
