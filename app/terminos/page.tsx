export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Términos de Servicio
        </h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-CL')}
        </p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Aceptación de términos
            </h2>
            <p>
              Al usar Red Patrimonio Chile, aceptas estos términos de servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Uso permitido
            </h2>
            <p>
              Esta plataforma es para reportar sitios arqueológicos en Chile 
              con fines de conservación y registro patrimonial.
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Reporta sitios de buena fe</li>
              <li>No divulgues coordenadas de sitios sensibles fuera de la plataforma</li>
              <li>Respeta las indicaciones de nivel de acceso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Propiedad intelectual
            </h2>
            <p>
              Al subir fotos, mantienes tus derechos de autor pero otorgas 
              permiso a Red Patrimonio Chile para mostrarlas en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Contacto
            </h2>
            <p>
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
