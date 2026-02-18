export function drawShape(ctx, x, y, size, type) {
    // ctx.beginPath(); // Caller should handle beginPath
    switch (type) {
        case 'Shield':
            drawShield(ctx, x, y, size);
            break;
        case 'Badge':
            drawBadge(ctx, x, y, size);
            break;
        case 'Circle':
        default:
            ctx.arc(x, y, size, 0, Math.PI * 2);
            break;
    }
}

function drawShield(ctx, x, y, size) {
    // Simple Shield Shape
    const w = size * 1.8;
    const h = size * 2.2;
    const topY = y - h / 2 * 0.8;
    const botY = y + h / 2;

    ctx.moveTo(x - w / 2, topY);
    ctx.lineTo(x + w / 2, topY);
    ctx.bezierCurveTo(x + w / 2, y + h / 4, x + w / 4, botY, x, botY);
    ctx.bezierCurveTo(x - w / 4, botY, x - w / 2, y + h / 4, x - w / 2, topY);
    ctx.closePath();
}

function drawBadge(ctx, x, y, size) {
    // Hexagon-like Badge
    const s = size * 1.1;
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.866, y - s * 0.5);
    ctx.lineTo(x + s * 0.866, y + s * 0.5);
    ctx.lineTo(x, y + s);
    ctx.lineTo(x - s * 0.866, y + s * 0.5);
    ctx.lineTo(x - s * 0.866, y - s * 0.5);
    ctx.closePath();
}
