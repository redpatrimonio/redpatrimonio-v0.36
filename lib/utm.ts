/**
 * Conversi\u00f3n WGS84 (lat/lon grados decimales) \u2192 UTM
 * Zona calculada autom\u00e1ticamente desde la longitud.
 */
export function latLonToUTM(
  lat: number,
  lon: number
): { easting: number; northing: number; zone: number } {
  const a  = 6378137.0
  const f  = 1 / 298.257223563
  const b  = a * (1 - f)
  const e2 = 1 - (b * b) / (a * a)
  const k0 = 0.9996

  const zone = Math.floor((lon + 180) / 6) + 1
  const lon0 = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180)

  const latR = lat * (Math.PI / 180)
  const lonR = lon * (Math.PI / 180)

  const N = a / Math.sqrt(1 - e2 * Math.sin(latR) ** 2)
  const T = Math.tan(latR) ** 2
  const C = (e2 / (1 - e2)) * Math.cos(latR) ** 2
  const A = Math.cos(latR) * (lonR - lon0)

  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256) * latR
      - ((3 * e2) / 8 + (3 * e2 ** 2) / 32 + (45 * e2 ** 3) / 1024) * Math.sin(2 * latR)
      + ((15 * e2 ** 2) / 256 + (45 * e2 ** 3) / 1024) * Math.sin(4 * latR)
      - ((35 * e2 ** 3) / 3072) * Math.sin(6 * latR))

  const easting =
    k0 *
      N *
      (A
        + ((1 - T + C) * A ** 3) / 6
        + ((5 - 18 * T + T ** 2 + 72 * C - 58 * (e2 / (1 - e2))) * A ** 5) / 120)
    + 500000

  const northingRaw =
    k0 *
    (M +
      N *
        Math.tan(latR) *
        (A ** 2 / 2
          + ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24
          + ((61 - 58 * T + T ** 2 + 600 * C - 330 * (e2 / (1 - e2))) * A ** 6) / 720))

  const northing = lat < 0 ? northingRaw + 10000000 : northingRaw

  return { easting, northing, zone }
}
