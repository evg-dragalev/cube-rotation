'use strict';

class Point{
    constructor(x, y, z){
        if(x === "") x = 0;
        if(y === "") y = 0;
        if(z === "") z = 0;

        this.x = x;
        this.y = y;
        this.z = z;
    }

    normalize(){
        if (this.x === 0 && this.y === 0 && this.z === 0) return this;

        let mod = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
        return new Point(
            this.x/mod,
            this.y/mod,
            this.z/mod
        );
    }

    move(x ,y, z){
        return new Point(
            this.x + x,
            this.y + y,
            this.z + z
        )
    }
}

//initial values
const FPS = 40;
// const MOVE_X = 300;
// const MOVE_Y = 300;
const ROTATION_VECTOR = new Point(100, 100, 100);
const R = 0.8;
const FI = 1.2*Math.PI;
const KSI = 0.1*Math.PI;
const ROTATION_ANGLE = 0.5*Math.PI;
// const FOCUS = new Point(300, 300, 300);
const T = 700;
const FOCUS = new Point(
    T*R*Math.cos(FI)*Math.cos(KSI),
    T*Math.sin(KSI),
    T*Math.sin(FI)*Math.cos(KSI)
);

const CUBE = [
    new Point(20, 20, 20),
    new Point(20, 100, 20),
    new Point(100, 100, 20),
    new Point(100, 20, 20),
    new Point(20, 20, 100),
    new Point(20, 100, 100),
    new Point(100, 100, 100),
    new Point(100, 20, 100)
];

function Screen(fiAngle, ksiAngle, length){
    let fi = fiAngle;
    let ksi = ksiAngle;
    let r = length;

    let vI;
    let vJ;
    let vK;
    culcBasis();

    function culcBasis(){
        let sinFi = Math.sin(fi);
        let cosFi = Math.cos(fi);
        let sinKsi = Math.sin(ksi);
        let cosKsi = Math.cos(ksi);

        vJ = new Point(
            -r*cosFi*sinKsi,
            -r*cosKsi,
            -r*sinFi*sinKsi
        );
        vI = new Point(
            -r*sinFi,
            0,
            r*cosFi
        );
        vK = new Point(
            -r*cosFi*cosKsi,
            -r*sinKsi,
            -r*sinFi*cosKsi
        );
    };

    this.setFi = function(angle){
        if(angle>=0 && angle<=2*Math.PI) {
            fi = angle;
            culcBasis();
        }
    };

    this.setKsi = function(angle){
        if(angle>=-0.5*Math.PI && angle<=0.5*Math.PI) {
            ksi = angle;
            culcBasis();
        }
    };

    this.setR = function(newr){
        r = newr;
        culcBasis();
    };

    this.proj = function(p, focus){
        if (focus === undefined){
            return this.orthogonalProj(p);
        } else {
            return this.centralProj(p, focus);
        }
    };

    this.orthogonalProj = function(p){ //ортогональная проекция
        //p - точка которую нужно спроецировать
        return new Point(
            vI.x*(p.x+vK.x*r) + vI.y*(p.y+vK.y*r) + vI.z*(p.z+vK.z*r),
            vJ.x*(p.x+vK.x*r) + vJ.y*(p.y+vK.y*r) + vJ.z*(p.z+vK.z*r),
            0
        );
    };

    this.centralProj = function(p, focus){ //цетральная проекция

        let cp = focus;
        let ptmp = new Point(
            vI.x*(p.x+vK.x*r) + vI.y*(p.y+vK.y*r) + vI.z*(p.z+vK.z*r),
            vJ.x*(p.x+vK.x*r) + vJ.y*(p.y+vK.y*r) + vJ.z*(p.z+vK.z*r),
            vK.x*(p.x+vK.x*r) + vK.y*(p.y+vK.y*r) + vK.z*(p.z+vK.z*r)
        );

        let ctmp = new Point(
            vI.x*(cp.x+vK.x*r) + vI.y*(cp.y+vK.y*r) + vI.z*(cp.z+vK.z*r),
            vJ.x*(cp.x+vK.x*r) + vJ.y*(cp.y+vK.y*r) + vJ.z*(cp.z+vK.z*r),
            vK.x*(cp.x+vK.x*r) + vK.y*(cp.y+vK.y*r) + vK.z*(cp.z+vK.z*r)
        );

        let a = ptmp.z/(ptmp.z-ctmp.z);
        let b = ctmp.z/(ptmp.z-ctmp.z);

        return new Point(
            ctmp.x*a + ptmp.x*b,
            ctmp.y*a + ptmp.y*b,
            0
        );
    };
}

function Rotator(X, Y, Z, fiAngle){
    let fi = fiAngle;
    let rotationVector = new Point(X, Y, Z);

    let A11, A12, A13;
    let A21, A22, A23;
    let A31, A32, A33;
    culcMatrix();

    this.getMatrix = function(){
        return [
            [A11, A12, A13],
            [A21, A22, A23],
            [A31, A32, A33]
        ];
    };

    this.getRotationVector = function(){
        return rotationVector;
    };

    this.getRotationAngle = function(){
        return fi;
    };

    this.setRotationAngle = function(angle){
        fi = angle;
        culcMatrix();
    };

    this.setRotationVectorX = function(x){
        rotationVector.x = x;
        culcMatrix();
    };

    this.setRotationVectorY = function(y){
        rotationVector.y = y;
        culcMatrix();
    };

    this.setRotationVectorZ = function(z){
        rotationVector.z = z;
        culcMatrix();
    };

    function culcMatrix(){
        console.log("Rotator changed: "+ fi+", ("+rotationVector.x+", "+rotationVector.y+", "+rotationVector.z+")");
        let sinFi = Math.sin(fi/FPS);
        let cosFi = Math.cos(fi/FPS);

        let sqrt = Math.sqrt(rotationVector.x*rotationVector.x
            +rotationVector.y*rotationVector.y
            +rotationVector.z*rotationVector.z);

        let nX = rotationVector.x/sqrt;
        let nY = rotationVector.y/sqrt;
        let nZ = rotationVector.z/sqrt;

        A11 = nX*nX + (1-nX*nX)*cosFi;
        A12 = nX*nY*(1-cosFi) - nZ*sinFi;
        A13 = nX*nZ*(1-cosFi) + nY*sinFi;

        A21 = nY*nX*(1-cosFi) + nZ*sinFi;
        A22 = nY*nY + (1-nY*nY)*cosFi;
        A23 = nY*nZ*(1-cosFi) - nX*sinFi;

        A31 = nZ*nX*(1-cosFi) - nY*sinFi;
        A32 = nZ*nY*(1-cosFi) + nX*sinFi;
        A33 = nZ*nZ + (1-nZ*nZ)*cosFi;
    }

    this.rotate = function(p){//p - точка которую нужно вращать
        return new Point(
            p.x*A11 + p.y*A12 + p.z*A13,
            p.x*A21 + p.y*A22 + p.z*A23,
            p.x*A31 + p.y*A32 + p.z*A33
        );
    };
}

function Drawer(context, screen, canvasWidth, canvasHeight){
    const self = this;
    let ctx = context;
    let width = canvasWidth;
    let height = canvasHeight;
    let xM = Math.round(width/2);
    let yM = Math.round(height/2);
    let cubeColor = 'rgba(117,250,117,0.3)';


    this.scr = screen;

    this.setCubeColor = function(color){
        cubeColor = color;
    };

    this.drawCube = function(cube, focus){
        let cPrj = [
            this.scr.proj(cube[0], focus).move(xM, yM, 0),
            this.scr.proj(cube[1], focus).move(xM, yM, 0),
            this.scr.proj(cube[2], focus).move(xM, yM, 0),
            this.scr.proj(cube[3], focus).move(xM, yM, 0),
            this.scr.proj(cube[4], focus).move(xM, yM, 0),
            this.scr.proj(cube[5], focus).move(xM, yM, 0),
            this.scr.proj(cube[6], focus).move(xM, yM, 0),
            this.scr.proj(cube[7], focus).move(xM, yM, 0)
        ];

        ctx.beginPath();
        ctx.moveTo(cPrj[0].x, cPrj[0].y);
        ctx.lineTo(cPrj[1].x, cPrj[1].y);
        ctx.lineTo(cPrj[2].x, cPrj[2].y);
        ctx.lineTo(cPrj[3].x, cPrj[3].y);
        ctx.fillStyle = cubeColor;
        ctx.fill();


        ctx.moveTo(cPrj[3].x, cPrj[3].y);
        ctx.lineTo(cPrj[7].x, cPrj[7].y);
        ctx.lineTo(cPrj[6].x, cPrj[6].y);
        ctx.lineTo(cPrj[2].x, cPrj[2].y);
        ctx.fillStyle = cubeColor;
        ctx.fill();

        ctx.moveTo(cPrj[6].x, cPrj[6].y);
        ctx.lineTo(cPrj[5].x, cPrj[5].y);
        ctx.lineTo(cPrj[1].x, cPrj[1].y);
        ctx.lineTo(cPrj[2].x, cPrj[2].y);
        ctx.fillStyle = cubeColor;
        ctx.fill();

        ctx.moveTo(cPrj[6].x, cPrj[6].y);
        ctx.lineTo(cPrj[5].x, cPrj[5].y);
        ctx.lineTo(cPrj[4].x, cPrj[4].y);
        ctx.lineTo(cPrj[7].x, cPrj[7].y);
        ctx.fillStyle = cubeColor;
        ctx.fill();

        ctx.moveTo(cPrj[4].x, cPrj[4].y);
        ctx.lineTo(cPrj[7].x, cPrj[7].y);
        ctx.lineTo(cPrj[3].x, cPrj[3].y);
        ctx.lineTo(cPrj[0].x, cPrj[0].y);
        ctx.fillStyle = cubeColor;
        ctx.fill();

        ctx.moveTo(cPrj[0].x, cPrj[0].y);
        ctx.lineTo(cPrj[1].x, cPrj[1].y);
        ctx.lineTo(cPrj[5].x, cPrj[5].y);
        ctx.lineTo(cPrj[4].x, cPrj[4].y);
        ctx.fillStyle = cubeColor;
        ctx.fill();

        ctx.strokeStyle = '#858585';
        ctx.moveTo(cPrj[0].x, cPrj[0].y);
        ctx.lineTo(cPrj[1].x, cPrj[1].y);
        ctx.lineTo(cPrj[2].x, cPrj[2].y);
        ctx.lineTo(cPrj[3].x, cPrj[3].y);
        ctx.lineTo(cPrj[0].x, cPrj[0].y);
        ctx.lineTo(cPrj[4].x, cPrj[4].y);
        ctx.lineTo(cPrj[5].x, cPrj[5].y);
        ctx.lineTo(cPrj[6].x, cPrj[6].y);
        ctx.lineTo(cPrj[7].x, cPrj[7].y);
        ctx.lineTo(cPrj[4].x, cPrj[4].y);
        ctx.moveTo(cPrj[3].x, cPrj[3].y);
        ctx.lineTo(cPrj[7].x, cPrj[7].y);
        ctx.moveTo(cPrj[2].x, cPrj[2].y);
        ctx.lineTo(cPrj[6].x, cPrj[6].y);
        ctx.moveTo(cPrj[1].x, cPrj[1].y);
        ctx.lineTo(cPrj[5].x, cPrj[5].y);
        ctx.stroke();
        ctx.closePath();
    };

    this.drawRotationVector = function(rotVect, focus){
        let rotVectProj = self.scr.proj(rotVect, focus).move(xM, yM, 0);
        let Op = self.scr.proj(new Point (0,0,0), focus).move(xM, yM, 0);

        ctx.beginPath();
        ctx.moveTo(Op.x, Op.y);
        ctx.lineTo(rotVectProj.x, rotVectProj.y);
        ctx.stroke();
        ctx.closePath();
    };

    const t1 = -5;
    const t2 = 150;

    this.drawBasePlane = function(focus){
        let lineXZ, lineZX;
        for(let i = -6; i <= 6; i++){
            lineXZ = [
                self.scr.proj(new Point(-2*t2, 0, 50*i), focus).move(xM, yM, 0),
                self.scr.proj(new Point(2*t2, 0, 50*i), focus).move(xM, yM, 0)
            ];

            lineZX = [
                self.scr.proj(new Point(50*i, 0, -2*t2), focus).move(xM, yM, 0),
                self.scr.proj(new Point(50*i, 0, 2*t2), focus).move(xM, yM, 0)
            ];

            ctx.beginPath();
            ctx.moveTo(lineXZ[0].x, lineXZ[0].y);
            ctx.lineTo(lineXZ[1].x, lineXZ[1].y);
            ctx.moveTo(lineZX[0].x, lineZX[0].y);
            ctx.lineTo(lineZX[1].x, lineZX[1].y);
            ctx.strokeStyle = '#858585';
            ctx.stroke();
            ctx.closePath();
        }
    };

    this.drawAxis = function(focus) {
        let OX = [
            self.scr.proj(new Point(t1, 0, 0), focus).move(xM, yM, 0),
            self.scr.proj(new Point(t2, 0, 0), focus).move(xM, yM, 0)
        ];
        let OY = [
            self.scr.proj(new Point(0, t1, 0), focus).move(xM, yM, 0),
            self.scr.proj(new Point(0, t2, 0), focus).move(xM, yM, 0)
        ];
        let OZ = [
            self.scr.proj(new Point(0, 0, t1), focus).move(xM, yM, 0),
            self.scr.proj(new Point(0, 0, t2), focus).move(xM, yM, 0)
        ];

        ctx.beginPath();
        ctx.moveTo(OX[0].x, OX[0].y);
        ctx.lineTo(OX[1].x, OX[1].y);
        ctx.strokeStyle = 'rgb(255,0,0)'; //red
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(OY[0].x, OY[0].y);
        ctx.lineTo(OY[1].x, OY[1].y);
        ctx.strokeStyle = 'rgb(0,255,0)'; //green
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(OZ[0].x, OZ[0].y);
        ctx.lineTo(OZ[1].x, OZ[1].y);
        ctx.strokeStyle = 'rgb(0,0,255)'; //blue
        ctx.stroke();
        ctx.closePath();
    };

    this.clear = function(){
        ctx.clearRect(0, 0, width, height);
    }
}

let state= {
    drawer: null,
    rotator: null,
    focus: null,
    isCentral: false,
    initValues: function(ctx, canvasWidth, canvasHeight){
        this.drawer = new Drawer(
            ctx,
            new Screen(FI, KSI, R),
            canvasWidth,
            canvasHeight
        );
        this.rotator = new Rotator(ROTATION_VECTOR.x, ROTATION_VECTOR.y, ROTATION_VECTOR.z, ROTATION_ANGLE);
        this.focus = FOCUS;
    },
    resetValues: function(){
        this.rotator = new Rotator(ROTATION_VECTOR.x, ROTATION_VECTOR.y, ROTATION_VECTOR.z, ROTATION_ANGLE);
        this.drawer.scr = new Screen(FI, KSI, R);
    },
};

function draw(){
    let canvas = document.getElementById('canvas');
    let ctx;
    if(canvas.getContext){
        ctx = canvas.getContext('2d');
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    state.initValues(ctx, canvas.width, canvas.height);

    function drawFrame(cube, focus){
        state.drawer.clear();
        state.drawer.drawBasePlane(focus);
        state.drawer.drawAxis(focus);
        state.drawer.drawRotationVector(state.rotator.getRotationVector(), focus);
        state.drawer.drawCube(cube, focus);

        cube.forEach((point, index) => {
            cube[index] = state.rotator.rotate(point);
        });

        if(state.isCentral === false) {
            setTimeout(drawFrame, 1000 / FPS, cube);
        } else {
            setTimeout(drawFrame, 1000 / FPS, cube, state.focus);
        }
    }

    drawFrame(CUBE);
}

function onBodyLoad(){
    draw();
}