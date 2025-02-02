export class Color {
  public hex: string = "";

  private constructor(
    private r: number,
    private g: number,
    private b: number,
    private opacity: number
  ) {
    this.hex = `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}${Math.floor(
      opacity * 255
    )
      .toString(16)
      .padStart(2, "0")}`;
  }

  static fromHex(hex: string, opacity = 1) {
    const formattedHex = hex.replace("#", "");
    const [rHex, gHex, bHex] = [
      formattedHex.slice(0, 2),
      formattedHex.slice(2, 4),
      formattedHex.slice(4, 6),
    ];
    const [r, g, b] = [
      parseInt(rHex, 16),
      parseInt(gHex, 16),
      parseInt(bHex, 16),
    ];

    return new Color(r, g, b, opacity);
  }

  static fromRGBA(r: number, g: number, b: number, a = 1) {
    return new Color(r, g, b, a);
  }

  withOpacity(opacity = this.opacity) {
    return new Color(
      this.r,
      this.g,
      this.b,
      opacity > 1 ? opacity / 100 : opacity
    );
  }

  toString() {
    return this.hex;
  }
}
