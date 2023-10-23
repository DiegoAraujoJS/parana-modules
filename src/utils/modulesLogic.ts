export type Line = [number, number, number, number]
export type Box = {position: [number, number], lines: Line[]}
export type MouseDownState = 1 | 2 | 3

export function generateLinesForBoxDifference(row: number, col: number, base: Line[]) {
  const lines = [
    [col - 1, row - 1, col - 1, row], // left
    [col - 1, row - 1, col, row - 1], // top
    [col - 1, row, col, row], // bottom
    [col, row - 1, col, row] // right
  ] as Line[]

  return lines.filter(line => !base.some(existingLine => isIdentical(line, existingLine)))
}

function isIdentical(line1: Line, line2: Line){
  return (line1[0] === line2[0] && line1[1] === line2[1] && line1[2] === line2[2] && line1[3] === line2[3])
}

export function lineIsVertical (line: Line) {
  return line[0] === line[2]
} 

export function generateInstructions(mouseDownState: MouseDownState): string[] {
  const result: string[] = []
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

export class TupleSet {
  private map: Map<string, Box> = new Map<string, Box>();

  add(tuple: [number, number], lines: Line[]) {
    const key = tuple.join(',');
    const existingLines = this.map.get(key)?.lines
    this.map.set(key, {position: tuple, lines: existingLines ? [...existingLines, ...lines] : lines });
  }

  has(tuple: [number, number]) {
    const key = tuple.join(',');
    return this.map.has(key);
  }

  delete(tuple: [number, number]) {
    const key = tuple.join(',');
    this.map.delete(key);
  }

  difference(otherSet: TupleSet): TupleSet {
    const diffSet = new TupleSet();
    this.map.forEach((value) => {
      if (!otherSet.has(value.position)) {
        diffSet.add(value.position, value.lines);
      }
    });
    return diffSet;
  }

  toArray(): Box[] {
    return Array.from(this.map.values());
  }
}
