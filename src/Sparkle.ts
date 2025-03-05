import { Vector3, MathUtils, Color } from "three";

export default class Sparkle extends Vector3 {
   private vector: Vector3 = new Vector3();
   public size: number = 0;
   private slowDown: number = 0;
   public color: Color = new Color();

   setup(origin: Vector3, color: Color, pixelRatio: number): void {
      this.x = origin.x;
      this.y = origin.y;
      this.z = origin.z;
      this.vector = new Vector3();
      /* X Speed */
      this.vector.x = MathUtils.randFloat(0.002, 0.008);
      /* Y Speed */
      this.vector.y = MathUtils.randFloat(0.002, 0.008);
      /* Z Speed */
      this.vector.z = MathUtils.randFloat(0.002, 0.008);
      this.size = Math.random() * 15 + 0.5 * pixelRatio;
      this.slowDown = 0.6 + Math.random() * 0.3; // For longer trails
      this.color = color;
   }

   update(): void {
      if (this.vector.x > 0.001 || this.vector.y > 0.001 || this.vector.z > 0.001) {
         this.add(this.vector);
         this.vector.multiplyScalar(this.slowDown);
      }
   }
}