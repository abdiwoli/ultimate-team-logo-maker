import '../style.css'
import { drawShape } from './shapes.js'

// State
const state = {
    name: 'BARRE',
    number: '15',
    logo: null, // Image object
    bgImage: null, // Image object for background texture
    ringColor: '#D4AF37',
    textColor: '#FF4500', // Updated to Orange-ish to match example
    stripeColor: '#2b369b',
    innerBorderColor: '#2b369b',
    baseColor: '#ffffff', // New state for base background
    centerBgColor: '#ffffff',
    outerSize: 380,
    innerSize: 240,
    logoZoom: 100,
    removeWhite: true,
    showStripes: true, // New state
    tolerance: 50,
    fontFamily: 'Arial',
    textStrokeWidth: 8,
    textStrokeColor: '#2b369b',
    nameSpacing: 12,
    numberSpacing: 12,
    nameRadiusOffset: 0,
    numberRadiusOffset: 0,
    shape: 'Circle',
    ringOpacity: 0, // Default 0
    centerOpacity: 100, // Default 100
    bgLoaded: false,
    logoLoaded: false
}

// Elements
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const downloadBtn = document.getElementById('downloadBtn')

// Inputs
const inputs = {
    name: document.getElementById('nameInput'),
    number: document.getElementById('numberInput'),
    logo: document.getElementById('logoInput'),
    bgImage: document.getElementById('bgImageInput'),
    ringColor: document.getElementById('ringColorInput'),
    textColor: document.getElementById('textColorInput'),
    stripeColor: document.getElementById('stripeColorInput'),
    innerBorderColor: document.getElementById('innerBorderColorInput'),
    baseColor: document.getElementById('baseColorInput'), // New input
    centerBg: document.getElementById('centerBgInput'),
    outerSize: document.getElementById('outerSizeInput'),
    innerSize: document.getElementById('innerSizeInput'),
    logoZoom: document.getElementById('logoZoomInput'),
    removeWhite: document.getElementById('removeWhiteCheck'),
    showStripes: document.getElementById('showStripesCheck'), // New input
    tolerance: document.getElementById('toleranceInput'),
    fontFamily: document.getElementById('fontFamilyInput'),
    textStrokeWidth: document.getElementById('textStrokeWidthInput'),
    textStrokeColor: document.getElementById('textStrokeColorInput'),
    nameSpacing: document.getElementById('nameSpacingInput'),
    numberSpacing: document.getElementById('numberSpacingInput'),
    nameRadiusOffset: document.getElementById('nameRadiusInput'),
    numberRadiusOffset: document.getElementById('numberRadiusInput'),
    shape: document.getElementById('shapeInput'),
    ringOpacity: document.getElementById('ringOpacityInput'),
    centerOpacity: document.getElementById('centerOpacityInput')
}

// Initialization
function init() {
    addEventListeners()
    draw()
}

function addEventListeners() {
    // Text inputs
    inputs.name.addEventListener('input', (e) => { state.name = e.target.value; draw() })
    inputs.number.addEventListener('input', (e) => { state.number = e.target.value; draw() })

    // Color inputs
    inputs.ringColor.addEventListener('input', (e) => { state.ringColor = e.target.value; draw() })
    inputs.textColor.addEventListener('input', (e) => { state.textColor = e.target.value; draw() })
    inputs.stripeColor.addEventListener('input', (e) => { state.stripeColor = e.target.value; draw() })
    if (inputs.innerBorderColor) inputs.innerBorderColor.addEventListener('input', (e) => { state.innerBorderColor = e.target.value; draw() })
    if (inputs.baseColor) inputs.baseColor.addEventListener('input', (e) => { state.baseColor = e.target.value; draw() })
    inputs.centerBg.addEventListener('input', (e) => { state.centerBgColor = e.target.value; draw() })

    // Size inputs
    inputs.outerSize.addEventListener('input', (e) => { state.outerSize = parseInt(e.target.value); draw() })
    inputs.innerSize.addEventListener('input', (e) => { state.innerSize = parseInt(e.target.value); draw() })
    inputs.logoZoom.addEventListener('input', (e) => { state.logoZoom = parseInt(e.target.value); draw() })

    // Advanced
    inputs.removeWhite.addEventListener('change', (e) => { state.removeWhite = e.target.checked; draw() })
    if (inputs.showStripes) inputs.showStripes.addEventListener('change', (e) => { state.showStripes = e.target.checked; draw() })
    inputs.tolerance.addEventListener('input', (e) => { state.tolerance = parseInt(e.target.value); draw() })
    inputs.fontFamily.addEventListener('change', (e) => { state.fontFamily = e.target.value; draw() })

    inputs.textStrokeWidth.addEventListener('input', (e) => { state.textStrokeWidth = parseInt(e.target.value); draw() })
    inputs.textStrokeColor.addEventListener('input', (e) => { state.textStrokeColor = e.target.value; draw() })
    inputs.nameSpacing.addEventListener('input', (e) => { state.nameSpacing = parseInt(e.target.value); draw() })
    inputs.numberSpacing.addEventListener('input', (e) => { state.numberSpacing = parseInt(e.target.value); draw() })
    inputs.nameRadiusOffset.addEventListener('input', (e) => { state.nameRadiusOffset = parseInt(e.target.value); draw() })
    inputs.numberRadiusOffset.addEventListener('input', (e) => { state.numberRadiusOffset = parseInt(e.target.value); draw() })
    inputs.shape.addEventListener('change', (e) => { state.shape = e.target.value; draw() })
    if (inputs.ringOpacity) inputs.ringOpacity.addEventListener('input', (e) => {
        state.ringOpacity = parseInt(e.target.value);
        document.getElementById('ringOpacityValue').textContent = state.ringOpacity + '%';
        draw()
    })
    if (inputs.centerOpacity) inputs.centerOpacity.addEventListener('input', (e) => {
        state.centerOpacity = parseInt(e.target.value);
        document.getElementById('centerOpacityValue').textContent = state.centerOpacity + '%';
        draw()
    })

    // File Uploads
    inputs.logo.addEventListener('change', handleLogoUpload)
    inputs.bgImage.addEventListener('change', handleBgUpload)

    // Download
    downloadBtn.addEventListener('click', downloadImage)
}

function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
                state.logo = img
                state.logoLoaded = true
                draw()
            }
            img.src = event.target.result
        }
        reader.readAsDataURL(file)
    }
}

function handleBgUpload(e) {
    const file = e.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
                state.bgImage = img
                state.bgLoaded = true
                draw()
            }
            img.src = event.target.result
        }
        reader.readAsDataURL(file)
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const { outerSize, innerSize } = state

    if (innerSize >= outerSize) return // Safety check

    // --- 1. DRAW BACKGROUND (STRIPES OR IMAGE) ---
    ctx.save()
    ctx.beginPath()
    drawShape(ctx, cx, cy, outerSize, state.shape)
    ctx.clip()

    // Base background (behind stripes)
    ctx.fillStyle = state.baseColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (state.bgLoaded && state.bgImage) {
        // Draw custom background image
        const scale = Math.max(canvas.width / state.bgImage.width, canvas.height / state.bgImage.height)
        const w = state.bgImage.width * scale
        const h = state.bgImage.height * scale
        ctx.drawImage(state.bgImage, cx - w / 2, cy - h / 2, w, h)
    } else if (state.showStripes) {
        // Draw Stripes
        ctx.fillStyle = state.stripeColor
        const stripeWidth = 60
        for (let i = -10; i < 10; i++) {
            ctx.fillRect(cx + (i * stripeWidth * 2) - (stripeWidth / 2), 0, stripeWidth, canvas.height)
        }
    }
    ctx.restore()

    // --- 2. DRAW RING BACKGROUND ---
    ctx.save()
    ctx.beginPath()
    drawShape(ctx, cx, cy, outerSize, state.shape)
    drawShape(ctx, cx, cy, innerSize, state.shape)

    ctx.globalAlpha = state.ringOpacity / 100
    ctx.fillStyle = state.ringColor
    ctx.fill('evenodd')
    ctx.restore()

    // --- 3. DRAW BORDERS ---
    ctx.save()
    ctx.strokeStyle = state.stripeColor
    // Let's stick to consistent theme or what we have.

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

    // --- 4. CENTER BACKGROUND ---
    ctx.save()
    ctx.beginPath()
    drawShape(ctx, cx, cy, innerSize, state.shape)
    ctx.globalAlpha = state.centerOpacity / 100
    ctx.fillStyle = state.centerBgColor
    ctx.fill()
    ctx.restore()

    // --- 5. DRAW TEXT ---
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Base radius + separate offsets
    const nameRadius = ((outerSize + innerSize) / 2) + state.nameRadiusOffset
    const numberRadius = ((outerSize + innerSize) / 2) + state.numberRadiusOffset

    // Use separate spacing logic from user code: spacing / 100
    const nameSpacing = state.nameSpacing / 100
    const numberSpacing = state.numberSpacing / 100

    // Name (Top)
    ctx.font = `bold 80px ${state.fontFamily}`
    drawTextAlongArc(ctx, state.name.toUpperCase(), cx, cy, nameRadius, nameSpacing, true)

    // Number (Bottom)
    ctx.font = `bold 100px ${state.fontFamily}`
    drawTextAlongArc(ctx, state.number, cx, cy, numberRadius, numberSpacing, false)

    // --- 6. DRAW LOGO ---
    if (state.logoLoaded && state.logo) {
        ctx.save()
        ctx.beginPath()
        drawShape(ctx, cx, cy, innerSize - 5, state.shape)
        ctx.clip()

        const scale = state.logoZoom / 100
        const logoSize = (innerSize * 2) * scale

        // Create temp canvas for processing
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        tempCanvas.width = logoSize
        tempCanvas.height = logoSize

        tempCtx.drawImage(state.logo, 0, 0, logoSize, logoSize)

        // SMART BACKGROUND REMOVAL (Flood Fill)
        if (state.removeWhite) {
            const imgData = tempCtx.getImageData(0, 0, logoSize, logoSize)
            const tolerance = state.tolerance

            // Flood fill from corners
            floodFillTransparency(imgData, 0, 0, tolerance)
            floodFillTransparency(imgData, logoSize - 1, logoSize - 1, tolerance)
            floodFillTransparency(imgData, logoSize - 1, 0, tolerance)
            floodFillTransparency(imgData, 0, logoSize - 1, tolerance)

            tempCtx.putImageData(imgData, 0, 0)
        }

        ctx.drawImage(tempCanvas, cx - logoSize / 2, cy - logoSize / 2)
        ctx.restore()
    } else {
        ctx.fillStyle = "rgba(100,100,100,0.5)"
        ctx.font = "30px Arial"
        ctx.fillText("Upload Logo", cx, cy)
    }
}

// --- HELPER FUNCTIONS ---

function isWhite(data, index, tolerance) {
    const r = data[index]
    const g = data[index + 1]
    const b = data[index + 2]
    const threshold = 255 - tolerance
    return (r > threshold && g > threshold && b > threshold)
}

function floodFillTransparency(imgData, startX, startY, tolerance) {
    const data = imgData.data
    const width = imgData.width
    const height = imgData.height
    const stack = [[startX, startY]]
    const visited = new Uint8Array(width * height)
    const startIdx = (startY * width + startX) * 4

    // Safety check: if start pixel isn't white, don't fill (prevents clearing whole image if it's full bleed color)
    if (!isWhite(data, startIdx, tolerance)) return

    while (stack.length > 0) {
        const [x, y] = stack.pop()
        const idx = (y * width + x) * 4

        if (x < 0 || x >= width || y < 0 || y >= height || visited[y * width + x]) continue

        visited[y * width + x] = 1

        if (isWhite(data, idx, tolerance)) {
            data[idx + 3] = 0 // Set alpha to 0
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
        }
    }
}

function drawTextAlongArc(ctx, str, cx, cy, radius, spacing, isTop) {
    ctx.save()
    const chars = str.split('')

    // Calculate total angle based on characters * user spacing
    // User code: (chars.length - 1) * spacing
    const totalAngle = (chars.length - 1) * spacing

    // Start centering
    const startAngle = isTop ? -Math.PI / 2 : Math.PI / 2
    const initialOffset = startAngle - (totalAngle / 2)

    ctx.fillStyle = state.textColor
    ctx.lineWidth = state.textStrokeWidth
    ctx.strokeStyle = state.textStrokeColor
    ctx.lineJoin = 'round'
    ctx.miterLimit = 2

    for (let i = 0; i < chars.length; i++) {
        // Calculate exact angle for this specific character
        const angle = initialOffset + (i * spacing)

        ctx.save()
        ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)

        // Rotate the character to match the curve
        if (isTop) {
            ctx.rotate(angle + Math.PI / 2)
        } else {
            ctx.rotate(angle - Math.PI / 2)
        }

        if (state.textStrokeWidth > 0) {
            ctx.strokeText(chars[i], 0, 0)
        }
        ctx.fillText(chars[i], 0, 0)

        ctx.restore()
    }
    ctx.restore()
}

function downloadImage() {
    const link = document.createElement('a')
    link.download = `team-${state.name}.png`
    link.href = canvas.toDataURL()
    link.click()
}

init()
