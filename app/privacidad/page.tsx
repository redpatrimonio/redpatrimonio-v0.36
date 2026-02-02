export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Política de Privacidad
        </h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-CL')}
        </p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Información que recopilamos
            </h2>
            <p>
              Red Patrimonio Chile recopila la siguiente información cuando usas Google Sign-In:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Foto de perfil (opcional)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Cómo usamos tu información
            </h2>
            <p>
              Usamos los datos de tu cuenta Google únicamente para:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Autenticar tu acceso a la plataforma</li>
              <li>Identificar los reportes que creas</li>
              <li>Personalizar tu experiencia en la app</li>
            </ul>
            <p className="mt-3">
              <strong>No compartimos</strong> tus datos con terceros. 
              No usamos tu información para publicidad ni marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Almacenamiento y seguridad
            </h2>
            <p>
              Tus datos se almacenan de forma segura en Supabase (infraestructura PostgreSQL). 
              Solo personal autorizado tiene acceso a la base de datos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Tus derechos
            </h2>
            <p>Puedes:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Acceder a tu información en cualquier momento desde tu perfil</li>
              <li>Solicitar eliminación de tu cuenta contactando a redpatrimonio.chile@gmail.com</li>
              <li>Revocar el acceso de Google desde tu cuenta Google</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Uso de Google API Services
            </h2>
            <p>
              El uso de información recibida de las APIs de Google cumple con la{' '}
              <a 
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google API Services User Data Policy
              </a>, incluyendo los requisitos de Uso Limitado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Contacto
            </h2>
            <p>
              Para preguntas sobre esta política, contacta a:{' '}
              <a 
                href="mailto:redpatrimonio.chile@gmail.com"
                className="text-blue-600 hover:underline"
              >
                redpatrimonio.chile@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
