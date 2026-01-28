'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function BuenasPracticasPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Botón Volver */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <Link 
          href="/mas"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <span className="text-2xl mr-2">&lt;</span>
          <span className="font-medium">Volver</span>
        </Link>
      </div>

      {/* Logo */}
      <div className="flex justify-center pt-4 pb-6">
        <Image 
          src="/logo.png" 
          alt="Red Patrimonio Chile" 
          width={140} 
          height={140} 
          className="object-contain"
        />
      </div>

      {/* Contenedor Principal */}
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Buenas Prácticas ante Hallazgos Arqueológicos
        </h1>

        {/* Contenido */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 space-y-6">
          
          {/* Sección 1: Por qué el contexto lo es todo */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Por qué el contexto lo es todo
            </h2>
            
            <p className="text-gray-700 leading-relaxed">
              Cada objeto arqueológico es un fragmento de nuestra historia, pero su verdadero valor no está solo en el objeto mismo, sino en <strong>dónde y cómo se encontró</strong>. Un ceramio, una punta de flecha o un hueso humano fuera de su lugar original pierden gran parte de su capacidad de contarnos quiénes fueron las personas que los crearon, usaron o depositaron ahí.
            </p>

            <p className="text-gray-700 leading-relaxed">
              La <strong>estratigrafía</strong> —las capas de tierra superpuestas en un sitio— funciona como las páginas de un libro: cada capa cuenta un momento distinto en el tiempo. Cuando un arqueólogo excava, registra minuciosamente la profundidad, orientación y asociación de cada hallazgo con otros materiales. Esta información permite datar los restos, comprender prácticas culturales, reconstruir modos de vida y conectar ese sitio con otros en el territorio.
            </p>

            <p className="text-gray-700 leading-relaxed">
              <strong>Cuando un objeto se saca de contexto, se borran esas páginas</strong>. Ya no podemos saber si ese ceramio tiene 500 o 2.000 años, si estaba en un entierro o en un basural, si convivió con herramientas de cobre o de piedra. Perdemos la posibilidad de que ese vestigio aporte a nuestra identidad colectiva, a entender cómo vivieron nuestros antepasados en este territorio, qué comían, cómo se organizaban, qué creían.
            </p>

            <p className="text-gray-700 leading-relaxed font-semibold">
              Por eso, proteger un hallazgo no es solo cumplir la ley: es resguardar la memoria de todos.
            </p>
          </section>

          {/* Separador */}
          <div className="border-t border-gray-200"></div>

          {/* Sección 2: ¿Encontraste algo? */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              ¿Encontraste algo que podría ser arqueológico?
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  1. Detén cualquier intervención
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Si durante una excavación, obra o caminata encuentras restos que podrían ser arqueológicos (piedras trabajadas, cerámicas, huesos, estructuras antiguas), <strong>detén la actividad en ese punto</strong>. No sigas removiendo tierra ni alteres el entorno inmediato.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  2. No toques, no recojas, no remuevas
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Puede ser tentador llevarse un objeto como recuerdo, pero al hacerlo eliminas la posibilidad de que ese hallazgo sea estudiado en su contexto. Los arqueólogos necesitan documentar cada detalle: la profundidad exacta, la orientación, los materiales asociados. Solo así el hallazgo puede aportar conocimiento.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  3. Protege el área
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Si es posible, marca o delimita visualmente el lugar para evitar que otros pisen o intervengan el sitio. Toma fotografías generales sin mover nada.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  4. Avisa de inmediato
                </h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Contacta al <strong>Consejo de Monumentos Nacionales (CMN)</strong> para que envíe a un arqueólogo a evaluar el hallazgo y determine las medidas de protección necesarias. También puedes avisar a:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Colegio de Arqueólogos de Chile: colegio@arqueologos.cl</li>
                  <li>Brigada de Delitos del Medio Ambiente (BIDEMA - PDI)</li>
                  <li>Carabineros de Chile</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-2">
                  El CMN coordinará la visita de un profesional para evaluar la naturaleza del hallazgo y las acciones a seguir.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  5. Comparte tu hallazgo de manera responsable
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Si quieres difundir tu descubrimiento, hazlo sin revelar coordenadas exactas ni detalles que faciliten saqueos. La comunidad arqueológica valora enormemente los reportes ciudadanos responsables.
                </p>
              </div>
            </div>
          </section>

          {/* Separador */}
          <div className="border-t border-gray-200"></div>

          {/* Sección 3: Marco legal */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Marco legal y patrimonial
            </h2>
            
            <p className="text-gray-700 leading-relaxed">
              En Chile, todos los sitios arqueológicos están protegidos por la <strong>Ley N° 17.288 de Monumentos Nacionales</strong>, que establece que son propiedad del Estado y no pueden ser intervenidos sin autorización del CMN. El Art. 26° obliga a denunciar todo hallazgo arqueológico.
            </p>

            <p className="text-gray-700 leading-relaxed">
              A nivel internacional, la <strong>UNESCO</strong> reconoce en su Recomendación sobre Principios Internacionales Aplicables a las Excavaciones Arqueológicas que estos bienes son <strong>patrimonio común de la humanidad</strong>, y establece que los Estados deben garantizar que cualquier descubrimiento sea declarado inmediatamente a las autoridades competentes.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Estas normas no buscan castigar, sino <strong>garantizar que los hallazgos sean estudiados por profesionales y puedan aportar a nuestra comprensión colectiva del pasado</strong>.
            </p>
          </section>

          {/* Separador */}
          <div className="border-t border-gray-200"></div>

          {/* Sección 4: Cierre motivacional */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Un hallazgo bien reportado es un aporte a nuestra historia
            </h2>
            
            <p className="text-gray-700 leading-relaxed">
              Cada vez que alguien encuentra restos arqueológicos y los reporta responsablemente, está contribuyendo a completar el mapa de nuestra historia territorial. Muchos sitios importantes han sido descubiertos gracias a avisos ciudadanos durante trabajos agrícolas, construcciones o simplemente caminatas.
            </p>

            <p className="text-gray-700 leading-relaxed font-semibold">
              Tu reporte puede ser la pieza que falta para entender un capítulo de nuestra historia compartida.
            </p>
          </section>

          {/* Botones de acción */}
          <div className="pt-6 grid md:grid-cols-2 gap-4">
            <Link
              href="/mas/contacto"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition hover:opacity-90 text-center"
              style={{ backgroundColor: '#25494D' }}
            >
              <span>💬</span>
              <span>¿Tienes dudas? Contáctanos</span>
            </Link>

            <Link
              href="/reportar"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition hover:opacity-90 text-center"
              style={{ backgroundColor: '#25494D' }}
            >
              <span>📍</span>
              <span>Reportar un hallazgo</span>
            </Link>
          </div>

        </div>

        {/* Referencias (opcional, pie de página) */}
        <div className="mt-6 px-4">
          <p className="text-xs text-gray-500 text-center">
            Fuentes: Guía de Procedimiento Arqueológico CMN (2020), Colegio de Arqueólogos de Chile, UNESCO
          </p>
        </div>

      </div>
    </div>
  )
}
