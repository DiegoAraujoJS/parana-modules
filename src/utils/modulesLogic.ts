export type Line = [number, number, number, number]
export type MouseDownState = 1 | 2 | 3

export function generateLinesForBox(row: number, col: number): Line[] {
  return [
    // [(a, b), (c, d)]
    // lines [(a, b), (c, d)] are always described following the following rule: for vertical lines, we always have b + 1 = d. For horizontal lines, we always have a + 1 = c.
    // This restriction helps us to compute the function isBoxMate for two mate lines.
    [col - 1, row - 1, col - 1, row], // left
    [col - 1, row - 1, col, row - 1], // top
    [col - 1, row, col, row], // bottom
    [col, row - 1, col, row] // right
  ]
}

export function isIdentical(line1: Line, line2: Line){
  return (line1[0] === line2[0] && line1[1] === line2[1] && line1[2] === line2[2] && line1[3] === line2[3])
}

export function isBoxMate(pairLineA: Line, pairLineB: Line, swaped = false): boolean {
  if (isIdentical(pairLineA, pairLineB)) return false

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [a1, b1, c1, d1] = pairLineA
  const [a2, b2, c2, d2] = pairLineB
  /* eslint-enable @typescript-eslint/no-unused-vars */
  return (a1 === a2 && b1 === b2) /* Therefore  */
    && (b1 + 1 === d1) /* Then */
    && (a2 + 1 === c2) 
    || (!swaped && isBoxMate(pairLineB, pairLineA, true))
}


export function lineIsVertical (line: Line) {
  return line[0] === line[2]
} 

export function generateInstructions(mouseDownState: MouseDownState): string[] {
  let result: string[] = []
  if (mouseDownState < 3) result.push("1. Presioná y pasá el cursor por las cajas")
  if (mouseDownState === 3) result.push("2. Tocá las columnas para generar espacios.", "Tocá las cajas para generar puertas")
  return result
}

export function deleteLine(lines: Line[], lineToDelete: Line) {
  return lines.filter(line => !isIdentical(line, lineToDelete))
}

export function getBoxPositionForLine(line: Line): [number, number] {
  return [line[0] + 1, line[1] + 1]
}
