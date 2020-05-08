import { BRUSH } from "../../server/rooms/State";
declare const _default: {
    /**
     * "Sketch" brush: https://codepen.io/kangax/pen/EjivI
  
    [BRUSH.SKETCH]: (ctx: CanvasRenderingContext2D, color: number, points: number[], isPreview: boolean = false) => {
      const rgb = getRGB(color);
      ctx.strokeStyle = toHex(color);
      ctx.lineWidth = 1;
  
      for (let i = (isPreview) ? points.length - 4 : 2; i < points.length; i += 2) {
        const moveToX = points[i - 2];
        const moveToY = points[i - 1];
  
        const currentX = points[i];
        const currentY = points[i + 1];
  
        ctx.beginPath();
        ctx.moveTo(moveToX, moveToY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
  
        // await new Promise(resolve => setTimeout(resolve, 1));
  
        for (var j = 0, len = points.length; j < len; j += 2) {
          const previousX = points[j];
          const previousY = points[j + 1];
  
          const dx = previousX - currentX;
          const dy = previousY - currentY;
          const d = dx * dx + dy * dy;
  
          if (d < 1000) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`;
            ctx.moveTo(currentX + (dx * 0.2), currentY + (dy * 0.2));
            ctx.lineTo(previousX - (dx * 0.2), previousY - (dy * 0.2));
            ctx.stroke();
          }
        }
      }
    },
    */
    /**
     * Pen: https://codepen.io/kangax/pen/aoxwb
     */
    p: (ctx: any, color: number, points: number[], isPreview?: boolean) => void;
    /**
     * Erarser: https://codepen.io/kangax/pen/aoxwb
     */
    e: (ctx: any, color: number, points: number[], isPreview?: boolean) => void;
    /**
     * Marker: https://codepen.io/kangax/pen/jLDAf
     */
    m: (ctx: any, color: number, points: number[], isPreview?: boolean) => void;
};
export default _default;
