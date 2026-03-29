import '../style.css'
import { drawShape } from './shapes.js'

// --- GLOBAL STATE ---
const state = {
    shape: 'Circle',
    bgImage: null,
    bgLoaded: false,
    outerSize: 380,
    innerSize: 240,
    ringColor: '#D4AF37',
    baseColor: '#ffffff',
    centerBgColor: '#ffffff',
    innerBorderColor: '#2b369b',
    stripeColor: '#2b369b',
    showStripes: true,
}

// --- ELEMENTS SYSTEM ---
let elements = [];
let selectedId = null;
let elementIdCounter = 1;

// Initialize with some default text to guide user
function createDefaultElements() {
    elements.push({
        id: elementIdCounter++,
        type: 'text',
        name: 'Top Curve Text',
        text: 'TEAM NAME',
        x: 0, y: 0,
        color: '#ffffff', strokeColor: '#000000',
        size: 80, strokeWidth: 0,
        font: 'Arial',
        isCurved: true,
        radius: 310, spacing: 12, angle: 0, isTop: true
    });
    elements.push({
        id: elementIdCounter++,
        type: 'text',
        name: 'Straight Subtext',
        text: 'EST. 2026',
        x: 0, y: 150,
        color: '#ffffff', strokeColor: '#000000',
        size: 30, strokeWidth: 0,
        font: 'Arial',
        isCurved: false,
        radius: 310, spacing: 12, angle: 0, isTop: false
    });
}
createDefaultElements();

function getSelectedElement() {
    return elements.find(el => el.id === selectedId);
}

// --- DOM ELEMENTS ---
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const layersList = document.getElementById('layersList');
const propsPanel = document.getElementById('propsPanel');

const bgs = {
    shape: document.getElementById('shapeInput'),
    bgImage: document.getElementById('bgImageInput'),
    outerSize: document.getElementById('outerSizeInput'),
    innerSize: document.getElementById('innerSizeInput'),
    ringColor: document.getElementById('ringColorInput'),
    baseColor: document.getElementById('baseColorInput'),
    centerBgColor: document.getElementById('centerBgInput'),
    innerBorderColor: document.getElementById('innerBorderColorInput'),
    stripeColor: document.getElementById('stripeColorInput'),
    showStripes: document.getElementById('showStripesCheck'),
};

const layerBtns = {
    addText: document.getElementById('addTextBtn'),
    addImage: document.getElementById('addImageBtn'),
    deleteLayer: document.getElementById('deleteLayerBtn'),
    upLayer: document.getElementById('layerUpBtn'),
    downLayer: document.getElementById('layerDownBtn')
};

const props = {
    // Shared
    x: document.getElementById('elXInput'),
    y: document.getElementById('elYInput'),
    // Text
    textContainer: document.getElementById('textProps'),
    text: document.getElementById('elTextInput'),
    color: document.getElementById('elColorInput'),
    strokeColor: document.getElementById('elStrokeColorInput'),
    size: document.getElementById('elSizeInput'),
    strokeWidth: document.getElementById('elStrokeWidthInput'),
    font: document.getElementById('elFontInput'),
    curvedCheck: document.getElementById('elCurvedCheck'),
    curveContainer: document.getElementById('curveProps'),
    radius: document.getElementById('elRadiusInput'),
    spacing: document.getElementById('elSpacingInput'),
    angle: document.getElementById('elAngleInput'),
    isTopCheck: document.getElementById('elIsTopCheck'),
    // Image
    imgContainer: document.getElementById('imageProps'),
    scale: document.getElementById('elScaleInput'),
    removeBgCheck: document.getElementById('elRemoveBgCheck'),
    removeBgColor: document.getElementById('elRemoveBgColorInput'),
    tolerance: document.getElementById('elToleranceInput'),
};


// --- INITIALIZATION ---
function init() {
    addEventListeners()
    updateLayersListUI();
    draw()
}

function addEventListeners() {
    // Background Events
    bgs.shape.addEventListener('change', (e) => { state.shape = e.target.value; draw() });
    bgs.outerSize.addEventListener('input', (e) => { state.outerSize = parseInt(e.target.value); draw() });
    bgs.innerSize.addEventListener('input', (e) => { state.innerSize = parseInt(e.target.value); draw() });
    bgs.ringColor.addEventListener('input', (e) => { state.ringColor = e.target.value; draw() });
    bgs.baseColor.addEventListener('input', (e) => { state.baseColor = e.target.value; draw() });
    bgs.centerBgColor.addEventListener('input', (e) => { state.centerBgColor = e.target.value; draw() });
    bgs.innerBorderColor.addEventListener('input', (e) => { state.innerBorderColor = e.target.value; draw() });
    bgs.stripeColor.addEventListener('input', (e) => { state.stripeColor = e.target.value; draw() });
    bgs.showStripes.addEventListener('change', (e) => { state.showStripes = e.target.checked; draw() });

    bgs.bgImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => { state.bgImage = img; state.bgLoaded = true; draw(); }
                img.src = ev.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    // Layer Buttons
    layerBtns.addText.addEventListener('click', () => {
        elements.push({
            id: elementIdCounter++, type: 'text', name: 'New Text',
            text: 'TEXT', x: 0, y: 0, color: '#ffffff', strokeColor: '#000000',
            size: 60, strokeWidth: 0, font: 'Arial', isCurved: false,
            radius: 310, spacing: 12, angle: 0, isTop: true
        });
        selectedId = elementIdCounter - 1;
        updateLayersListUI();
        draw();
    });

    layerBtns.addImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                elements.push({
                    id: elementIdCounter++, type: 'image', name: file.name || 'Image',
                    img: img, imgLoaded: true, x: 0, y: 0,
                    scale: 100, removeBg: false, removeBgColor: '#ffffff', tolerance: 50
                });
                selectedId = elementIdCounter - 1;
                updateLayersListUI();
                draw();
            }
            img.src = ev.target.result;
        }
        reader.readAsDataURL(file);
        e.target.value = '';
    });

    layerBtns.deleteLayer.addEventListener('click', () => {
        if (!selectedId) return;
        elements = elements.filter(el => el.id !== selectedId);
        selectedId = null;
        updateLayersListUI();
        draw();
    });

    layerBtns.upLayer.addEventListener('click', () => {
        if (!selectedId) return;
        const idx = elements.findIndex(el => el.id === selectedId);
        if (idx < elements.length - 1) {
            [elements[idx], elements[idx+1]] = [elements[idx+1], elements[idx]];
            updateLayersListUI();
            draw();
        }
    });

    layerBtns.downLayer.addEventListener('click', () => {
        if (!selectedId) return;
        const idx = elements.findIndex(el => el.id === selectedId);
        if (idx > 0) {
            [elements[idx], elements[idx-1]] = [elements[idx-1], elements[idx]];
            updateLayersListUI();
            draw();
        }
    });

    layersList.addEventListener('change', (e) => {
        selectedId = parseInt(e.target.value);
        updatePropsUI();
        draw();
    });

    // Props Update Event Generator
    const updateEl = (key, parseFn) => (e) => {
        const el = getSelectedElement();
        if (el) {
            el[key] = parseFn ? parseFn(e.target) : e.target.value;
            // update list name if text changed without rebuilding entire list
            if (key === 'text') {
               el.name = el.text.substring(0, 15) || 'Text';
               const option = Array.from(layersList.options).find(opt => parseInt(opt.value) === el.id);
               if (option) option.textContent = `📝 ${el.name}`;
            }
            draw();
        }
    };

    const asInt = t => parseInt(t.value) || 0;
    const asFloat = t => parseFloat(t.value) || 0;
    const asBool = t => t.checked;

    props.x.addEventListener('input', updateEl('x', asInt));
    props.y.addEventListener('input', updateEl('y', asInt));
    props.text.addEventListener('input', updateEl('text'));
    props.color.addEventListener('input', updateEl('color'));
    props.strokeColor.addEventListener('input', updateEl('strokeColor'));
    props.size.addEventListener('input', updateEl('size', asInt));
    props.strokeWidth.addEventListener('input', updateEl('strokeWidth', asInt));
    props.font.addEventListener('change', updateEl('font'));
    
    props.curvedCheck.addEventListener('change', (e) => {
        const el = getSelectedElement();
        if(el) { el.isCurved = e.target.checked; updatePropsUI(); draw(); }
    });
    
    props.radius.addEventListener('input', updateEl('radius', asInt));
    props.spacing.addEventListener('input', updateEl('spacing', asInt));
    props.angle.addEventListener('input', updateEl('angle', asInt));
    props.isTopCheck.addEventListener('change', updateEl('isTop', asBool));
    
    props.scale.addEventListener('input', updateEl('scale', asInt));
    props.removeBgCheck.addEventListener('change', updateEl('removeBg', asBool));
    props.removeBgColor.addEventListener('input', updateEl('removeBgColor'));
    props.tolerance.addEventListener('input', updateEl('tolerance', asInt));

    // Dragging Logic
    setupCanvasDragging();
    document.getElementById('downloadBtn').addEventListener('click', downloadImage);
}

// --- CANVAS DRAGGING ---
let isDragging = false;
let dragStartX = 0; let dragStartY = 0;
let elStartX = 0; let elStartY = 0;

function setupCanvasDragging() {
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const px = (e.clientX - rect.left) * scaleX - canvas.width / 2;
        const py = (e.clientY - rect.top) * scaleY - canvas.height / 2;
        
        let clickedEl = null;
        // Top to bottom (render reverse)
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i];
            
            if (el.type === 'image') {
                const w = el.drawWidth || 100;
                const h = el.drawHeight || 100;
                if (px >= el.x - w/2 && px <= el.x + w/2 && py >= el.y - h/2 && py <= el.y + h/2) {
                    clickedEl = el; break;
                }
            } else if (el.type === 'text') {
                if (el.isCurved) {
                    // Approximate ring hit detection
                    const dist = Math.hypot(px - el.x, py - el.y);
                    if (Math.abs(dist - el.radius) < el.size * 1.5) {
                        clickedEl = el; break;
                    }
                } else {
                    ctx.font = `bold ${el.size}px ${el.font}`;
                    const metrics = ctx.measureText(el.text);
                    const w = metrics.width;
                    if (px >= el.x - w/2 && px <= el.x + w/2 && py >= el.y - el.size/2 && py <= el.y + el.size/2) {
                        clickedEl = el; break;
                    }
                }
            }
        }

        if (clickedEl) {
            selectedId = clickedEl.id;
            updateLayersListUI();
            updatePropsUI();
            isDragging = true;
            dragStartX = px; dragStartY = py;
            elStartX = clickedEl.x; elStartY = clickedEl.y;
            draw();
        } else {
            selectedId = null;
            updateLayersListUI();
            updatePropsUI();
            draw();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging || !selectedId) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const px = (e.clientX - rect.left) * scaleX - canvas.width / 2;
        const py = (e.clientY - rect.top) * scaleY - canvas.height / 2;
        
        const dx = px - dragStartX;
        const dy = py - dragStartY;
        
        const el = getSelectedElement();
        el.x = elStartX + dx;
        el.y = elStartY + dy;
        
        props.x.value = el.x;
        props.y.value = el.y;
        draw();
    });

    canvas.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('mouseleave', () => { isDragging = false; });
}

// --- UI UPDATES ---
function updateLayersListUI(forceSelect = true) {
    layersList.innerHTML = '';
    // Reverse display (top element first)
    [...elements].reverse().forEach(el => {
        const option = document.createElement('option');
        option.value = el.id;
        option.textContent = `${el.type === 'image' ? '🖼️' : '📝'} ${el.name}`;
        if (el.id === selectedId) option.selected = true;
        
        // Add minimal styling to make list nice
        option.style.padding = '8px';
        option.style.borderBottom = '1px solid #eee';
        
        layersList.appendChild(option);
    });
    if (forceSelect) updatePropsUI();
}

function updatePropsUI() {
    if (!selectedId) {
        propsPanel.style.display = 'none';
        return;
    }
    const el = getSelectedElement();
    if (!el) return;

    propsPanel.style.display = 'block';
    
    props.x.value = el.x;
    props.y.value = el.y;

    if (el.type === 'text') {
        props.textContainer.style.display = 'block';
        props.imgContainer.style.display = 'none';
        
        props.text.value = el.text;
        props.color.value = el.color;
        props.strokeColor.value = el.strokeColor;
        props.size.value = el.size;
        props.strokeWidth.value = el.strokeWidth;
        props.font.value = el.font;
        props.curvedCheck.checked = el.isCurved;
        
        if (el.isCurved) {
            props.curveContainer.style.display = 'block';
            props.radius.value = el.radius;
            props.spacing.value = el.spacing;
            props.angle.value = el.angle;
            props.isTopCheck.checked = el.isTop;
        } else {
            props.curveContainer.style.display = 'none';
        }
    } else if (el.type === 'image') {
        props.textContainer.style.display = 'none';
        props.imgContainer.style.display = 'block';
        
        props.scale.value = el.scale;
        props.removeBgCheck.checked = el.removeBg;
        props.removeBgColor.value = el.removeBgColor || '#ffffff';
        props.tolerance.value = el.tolerance;
    }
}


// --- MAIN DRAW ENGINE ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const { outerSize, innerSize } = state

    if (innerSize >= outerSize) return 

    // 1. DRAW BACKGROUND (STRIPES OR IMAGE)
    ctx.save()
    ctx.beginPath()
    drawShape(ctx, cx, cy, outerSize, state.shape)
    ctx.clip()

    ctx.fillStyle = state.baseColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (state.bgLoaded && state.bgImage) {
        const scale = Math.max(canvas.width / state.bgImage.width, canvas.height / state.bgImage.height)
        const w = state.bgImage.width * scale
        const h = state.bgImage.height * scale
        ctx.drawImage(state.bgImage, cx - w / 2, cy - h / 2, w, h)
    } else if (state.showStripes) {
        ctx.fillStyle = state.stripeColor
        const stripeWidth = 60
        for (let i = -10; i < 10; i++) {
            ctx.fillRect(cx + (i * stripeWidth * 2) - (stripeWidth / 2), 0, stripeWidth, canvas.height)
        }
    }
    ctx.restore()

    // 2. DRAW RING BACKGROUND
    ctx.save()
    ctx.beginPath()
    drawShape(ctx, cx, cy, outerSize, state.shape)
    drawShape(ctx, cx, cy, innerSize, state.shape)
    ctx.fillStyle = state.ringColor
    ctx.fill('evenodd')
    ctx.restore()

    // 3. DRAW BORDERS
    ctx.save()
    // Inner Border
    ctx.lineWidth = 5
    ctx.strokeStyle = state.innerBorderColor
    ctx.beginPath()
    drawShape(ctx, cx, cy, innerSize, state.shape)
    ctx.stroke()

    // Outer Border
    ctx.lineWidth = 15
    ctx.strokeStyle = state.stripeColor
    ctx.beginPath()
    drawShape(ctx, cx, cy, outerSize, state.shape)
    ctx.stroke()
    ctx.restore()

    // 4. CENTER BACKGROUND
    ctx.save()
    ctx.beginPath()
    drawShape(ctx, cx, cy, innerSize, state.shape)
    ctx.fillStyle = state.centerBgColor
    ctx.fill()
    ctx.restore()

    // 5. DRAW ELEMENTS (Bottom to Top)
    elements.forEach(el => {
        if (el.type === 'image' && el.imgLoaded && el.img) {
            ctx.save()
            const scale = el.scale / 100
            const logoAspectRatio = el.img.width / el.img.height
            const refSize = innerSize * 2
            
            let drawWidth, drawHeight;
            if (logoAspectRatio > 1) {
                drawWidth = refSize * scale;
                drawHeight = drawWidth / logoAspectRatio;
            } else {
                drawHeight = refSize * scale;
                drawWidth = drawHeight * logoAspectRatio;
            }
            
            el.drawWidth = drawWidth;
            el.drawHeight = drawHeight;

            const tempCanvas = document.createElement('canvas')
            const tempCtx = tempCanvas.getContext('2d')
            tempCanvas.width = drawWidth
            tempCanvas.height = drawHeight
            tempCtx.drawImage(el.img, 0, 0, drawWidth, drawHeight)

            if (el.removeBg) {
                const imgData = tempCtx.getImageData(0, 0, drawWidth, drawHeight)
                const targetColor = hexToRgb(el.removeBgColor || '#ffffff')
                floodFillTransparency(imgData, 0, 0, el.tolerance, targetColor)
                floodFillTransparency(imgData, drawWidth - 1, drawHeight - 1, el.tolerance, targetColor)
                floodFillTransparency(imgData, drawWidth - 1, 0, el.tolerance, targetColor)
                floodFillTransparency(imgData, 0, drawHeight - 1, el.tolerance, targetColor)
                tempCtx.putImageData(imgData, 0, 0)
            }

            const drawX = cx + el.x - drawWidth / 2;
            const drawY = cy + el.y - drawHeight / 2;
            ctx.drawImage(tempCanvas, drawX, drawY)
            
            if (el.id === selectedId) {
                ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
                ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
            }
            ctx.restore()

        } else if (el.type === 'text') {
            ctx.save()
            ctx.font = `bold ${el.size}px ${el.font}`
            ctx.fillStyle = el.color
            ctx.lineWidth = el.strokeWidth
            ctx.strokeStyle = el.strokeColor
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.lineJoin = 'round'

            if (el.isCurved) {
                drawTextAlongArc(ctx, el.text.toUpperCase(), cx + el.x, cy + el.y, el.radius, el.spacing / 100, el.isTop, el.angle)
                
                if (el.id === selectedId) {
                    ctx.beginPath();
                    ctx.arc(cx + el.x, cy + el.y, el.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(0,229,255,0.4)'; ctx.lineWidth = el.size; ctx.stroke();
                }
            } else {
                if (el.strokeWidth > 0) ctx.strokeText(el.text, cx + el.x, cy + el.y);
                ctx.fillText(el.text, cx + el.x, cy + el.y);
                
                if (el.id === selectedId) {
                    const metrics = ctx.measureText(el.text);
                    ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
                    ctx.strokeRect(cx + el.x - metrics.width/2 - 10, cy + el.y - el.size/2 - 10, metrics.width + 20, el.size + 20);
                }
            }
            ctx.restore()
        }
    });

}

// --- HELPER FUNCTIONS ---

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
}

function isTargetColorMatch(data, index, targetColor, tolerance) {
    const r = data[index]
    const g = data[index + 1]
    const b = data[index + 2]
    return (Math.abs(r - targetColor.r) <= tolerance && 
            Math.abs(g - targetColor.g) <= tolerance && 
            Math.abs(b - targetColor.b) <= tolerance)
}

function floodFillTransparency(imgData, startX, startY, tolerance, targetColor) {
    const data = imgData.data
    const width = imgData.width
    const height = imgData.height
    const stack = [[startX, startY]]
    const visited = new Uint8Array(width * height)
    const startIdx = (startY * width + startX) * 4

    if (!isTargetColorMatch(data, startIdx, targetColor, tolerance)) return

    while (stack.length > 0) {
        const [x, y] = stack.pop()
        const idx = (y * width + x) * 4

        if (x < 0 || x >= width || y < 0 || y >= height || visited[y * width + x]) continue

        visited[y * width + x] = 1

        if (isTargetColorMatch(data, idx, targetColor, tolerance)) {
            data[idx + 3] = 0 // transparent
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
        }
    }
}

function drawTextAlongArc(ctx, str, cx, cy, radius, spacing, isTop, angleOffsetDegrees = 0) {
    ctx.save()
    const chars = str.split('')

    const totalAngle = (chars.length - 1) * spacing
    const angleOffsetRad = angleOffsetDegrees * Math.PI / 180;

    const startAngle = (isTop ? -Math.PI / 2 : Math.PI / 2) + angleOffsetRad;
    const initialOffset = startAngle - (totalAngle / 2)

    for (let i = 0; i < chars.length; i++) {
        const angle = initialOffset + (i * spacing)
        ctx.save()
        ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)

        if (isTop) {
            ctx.rotate(angle + Math.PI / 2)
        } else {
            ctx.rotate(angle - Math.PI / 2)
        }

        if (ctx.lineWidth > 0) ctx.strokeText(chars[i], 0, 0)
        ctx.fillText(chars[i], 0, 0)
        ctx.restore()
    }
    ctx.restore()
}

function downloadImage() {
    // Before download, draw without selections
    const prevSel = selectedId;
    selectedId = null;
    draw();
    
    const link = document.createElement('a')
    link.download = `ultimate-logo.png`
    link.href = canvas.toDataURL()
    link.click()
    
    selectedId = prevSel;
    draw();
}

init()
