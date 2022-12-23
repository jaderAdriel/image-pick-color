
export class App {

    data = [];
    img = {
        'element': undefined,
        'data': undefined
    };
    palette;

    constructor( props ) {
        this.canvas = props.canvas;
        this.ctx = props.ctx;
        this.canvas.width = props.width;
        this.canvas.style.width = props.width;
        this.canvas.height = props.height;
        this.canvas.style.height = props.height;

        this.img.element = props.img.element;
        this.img.element.src = props.img.src;
        this.img.element.onload = (e) => this.drawImage();
        this.palette = props.palette;
    }

    setImageSource(src) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.img.element.src = src;
        this.img.element.onload = (e) => {this.drawImage()};
    }

    removeRepeatedColor(interval = 20) {
        const checkInterval = (a, b, interval) => {
            interval = interval/2;
            if (a - interval <= b && a - interval <= b) return true;
            return false;
        }

        this.data = this.data.reduce((acc,curr) => {

            let isOnInteral = 1;


            for (let index = 0; index < acc.length; index++) {
                if (!( checkInterval( curr.r, acc[index].r, interval ) &&
                       checkInterval( curr.g, acc[index].g, interval ) &&
                       checkInterval( curr.b, acc[index].b, interval ))) continue;
                isOnInteral++;
                
            }
            if (isOnInteral > 1) return acc;

            acc.push(curr);

            return acc;

        }, []);
    }

    addColor(element) {
        element.innerHtml = '';



        this.data.forEach((color) => {

            const newDiv = document.createElement("div");
            newDiv.classList.add('color');
            newDiv.innerHTML = `
                <div class="color__copy"> <i class="fa-regular fa-clone"></i> </div>
                <span class="color__code"> rgb(${color.r},${color.g},${color.b}) </span>
                `
            newDiv.style.backgroundColor = `rgb(${color.r},${color.g},${color.b})`

            element.append( newDiv)
        });

        const color = document.querySelectorAll('.color');

        color.forEach(e => {
            const color_copy = e.querySelector('.color__copy');
            const color_code = e.querySelector('.color__code');

            color_copy.addEventListener('click', () => {
                navigator.clipboard.writeText(color_code.innerText);
            });
        });
    }

    drawImage() {
        let hRatio = this.canvas.width / this.img.element.width,
        vRatio = this.canvas.height / this.img.element.height,
        ratio  = Math.min ( hRatio, vRatio ),
        centerShift_x = ( this.canvas.width - this.img.element.width*ratio ) / 2,
        centerShift_y = ( this.canvas.height - this.img.element.height*ratio ) / 2;

        this.ctx.drawImage( 
            this.img.element, 
            0, 
            0, 
            this.img.element.width, 
            this.img.element.height, 
            centerShift_x, 
            centerShift_y,
            this.img.element.width * ratio, 
            this.img.element.height * ratio
        );

        this.img.data = this.ctx.getImageData( 0, 0, this.canvas.width, this.canvas.height).data;
        
        let rgbValues = this.buildRgb(this.img.data);
        this.data = this.quantization(rgbValues, 0);
        this.addColor(this.palette)
    }

    getPixel(e) {
        const { offsetX:row, offsetY:col} = e;
        let color = this.getPixelColor(this.canvas.width, row, col);
        return color;
    }

    getPixelColor (numberOfCols, col, row ) {
        const pixel = numberOfCols * row + col;
        const arrayPos = pixel * 4;
        const [r, g, b, a] = this.img.data.slice(arrayPos, arrayPos+4);
        return { r,g,b,a};
    }

    buildRgb (imageData) {
        const rgbValues = [];
        for (let i = 0; i < imageData.length; i += 4) {
          const rgb = {
            r: imageData[i],
            g: imageData[i + 1],
            b: imageData[i + 2],
          };
          rgbValues.push(rgb);
        }
        return rgbValues;
    }

    findBiggestColorRange(rgbValues) {
        let rMin = Number.MAX_VALUE;
        let gMin = Number.MAX_VALUE;
        let bMin = Number.MAX_VALUE;
      
        let rMax = Number.MIN_VALUE;
        let gMax = Number.MIN_VALUE;
        let bMax = Number.MIN_VALUE;
      
        rgbValues.forEach((pixel) => {
          rMin = Math.min(rMin, pixel.r);
          gMin = Math.min(gMin, pixel.g);
          bMin = Math.min(bMin, pixel.b);
      
          rMax = Math.max(rMax, pixel.r);
          gMax = Math.max(gMax, pixel.g);
          bMax = Math.max(bMax, pixel.b);
        });
      
        const rRange = rMax - rMin;
        const gRange = gMax - gMin;
        const bRange = bMax - bMin;
      
        const biggestRange = Math.max(rRange, gRange, bRange);
        if (biggestRange === rRange) {
          return "r";
        } else if (biggestRange === gRange) {
          return "g";
        } else {
          return "b";
        }
    };

    quantization(rgbValues, depth) {

        const MAX_DEPTH = 4;
        if (depth === MAX_DEPTH || rgbValues.length === 0) {
            const color = rgbValues.reduce(
            (prev, curr) => {
                prev.r += curr.r;
                prev.g += curr.g;
                prev.b += curr.b;

                return prev;
            },
            {
                r: 0,
                g: 0,
                b: 0,
            }
            );
            color.r = Math.round(color.r / rgbValues.length);
            color.g = Math.round(color.g / rgbValues.length);
            color.b = Math.round(color.b / rgbValues.length);
            return [color];
        }

        const componentToSortBy = this.findBiggestColorRange(rgbValues);
        const mid = rgbValues.length / 2;

        rgbValues.sort((p1, p2) => {
            return p1[componentToSortBy] - p2[componentToSortBy];
        });
        return [
            ...this.quantization(rgbValues.slice(0, mid), depth + 1),
            ...this.quantization(rgbValues.slice(mid + 1), depth + 1),
        ];
    }
}


