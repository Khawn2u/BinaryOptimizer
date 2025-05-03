Math.lerp = function(a,b,t) {
    return a+((b-a)*t);
}
class InputBit {
    constructor(v) {
        this.Out = v === undefined ? 0.5 : v;
        this.Cached = false;
        this.GradCached = false;
        this.Grad = 0;
        this.NumOutputs = 0;
        this.NumGrad = 0;
    }
    gradient() {
        this.GradCached = true;
    }
    evaluateGradient(g) {
        this.Grad += g;
    }
    uncache() {
        this.Cached = false;
        this.GradCached = false;
    }
    step(m) {
        if (this.GradCached) {
            // this.set(this.evaluate()+(this.Grad*m));
            var mult = this.evaluate();
            mult = mult*(1-mult);
            // this.Ada = Math.lerp(this.Grad**2,this.Ada,0.8);
            // var mult = 1/Math.sqrt(Number.EPSILON+this.Ada);
            this.set(this.evaluate()+(this.Grad*m*mult));
            this.uncache();
        }
    }
    getInputs() {
        return new Set([this]);
    }
    evaluate() {
        this.Cached = true;
        return this.Out;
    }
    collapse() {
        this.set(Math.round(this.evaluate()));
    }
    collapseRandom() {
        this.set(Math.random() < this.evaluate() ? 1 : 0);
    }
    set(v) {
        this.Cached = false;
        this.GradCached = false;
        this.Grad = 0;
        this.Out = v;
        if (this.Out > 1) {
            this.Out = 1;
        }
        if (this.Out < 0) {
            this.Out = 0;
        }
    }
}
class OptimizableGateUnit extends InputBit {
    constructor(a,b) {
        super();
        if (a) {
            this.A = a;
        } else {
            this.A = new InputBit();
        }
        if (b) {
            this.B = b;
        } else {
            this.B = new InputBit();
        }
        this.GradCached = false;
        this.GradA = 0;
        this.GradB = 0;
        this.GateStrengths = new Float64Array(16).fill(0.0625);
    }
    evaluate() {
        if (this.Cached && (this.A.Cached && this.B.Cached)) {
            return this.Out;
        } else {
            var a = this.A.evaluate();
            var b = this.B.evaluate();
            this.set((this.GateStrengths[1]*((1-a)*(1-b)))+(this.GateStrengths[2]*(a*(1-b)))+(this.GateStrengths[3]*(1-b))+(this.GateStrengths[4]*((1-a)*b))+(this.GateStrengths[5]*(1-a))+(this.GateStrengths[6]*(a+b-(2*a*b)))+(this.GateStrengths[7]*(1-(a*b)))+(this.GateStrengths[8]*(a*b))+(this.GateStrengths[9]*(1-(a+b-(2*a*b))))+(this.GateStrengths[10]*(a))+(this.GateStrengths[11]*(1-(b*(1-a))))+(this.GateStrengths[12]*(b))+(this.GateStrengths[13]*(1-(a*(1-b))))+(this.GateStrengths[14]*(a+b-(a*b)))+this.GateStrengths[1]);
            this.Cached = true;
            return this.Out;
        }
    }
    gradient() {
        if (this.GradCached) {
            // this.Grad += g;
            this.NumOutputs++;
            return [this.GradA,this.GradB];
            // return [this.A.gradient(this.GradA*g),this.B.gradient(this.GradB*g)];
        } else {
            var a = this.A.evaluate();
            var b = this.B.evaluate();
            this.GradA = (this.GateStrengths[1]*(b-1))+(this.GateStrengths[2]*(1-b))+(this.GateStrengths[4]*(-b))+(this.GateStrengths[5]*(-1))+(this.GateStrengths[6]*((-2*b)+1))+(this.GateStrengths[7]*(-b))+(this.GateStrengths[8]*(b))+(this.GateStrengths[9]*((2*b)-1))+(this.GateStrengths[10]*(1))+(this.GateStrengths[11]*(b))+(this.GateStrengths[13]*(b-1))+(this.GateStrengths[14]*(1-b));
            this.GradB = (this.GateStrengths[1]*(a-1))+(this.GateStrengths[2]*(-a))+(this.GateStrengths[3]*(-1))+(this.GateStrengths[4]*(1-a))+(this.GateStrengths[6]*((-2*a)+1))+(this.GateStrengths[7]*(-a))+(this.GateStrengths[8]*(a))+(this.GateStrengths[9]*((2*a)-1))+(this.GateStrengths[11]*(a-1))+(this.GateStrengths[12]*(1))+(this.GateStrengths[13]*(a))+(this.GateStrengths[14]*(1-a));
            // var l = Math.max(Math.sqrt((this.GradA**2)+(this.GradB**2)),Number.MIN_VALUE);
            // l = ((l-1)*0.0625)+1;
            // this.GradA /= l;
            // this.GradB /= l;
            this.GradCached = true;
            this.Grad = 0;
            this.NumOutputs = 1;
            this.A.gradient();
            this.B.gradient();
            return [this.GradA,this.GradB];
        }
    }
    evaluateGradient(g) {
        if (!this.GradCached) {
            this.gradient();
            this.Grad = 0;
        }
        this.NumGrad++;
        this.Grad += g;
        // console.log(this.NumGrad,this.NumOutputs);
        if (this.NumGrad >= this.NumOutputs) {
            this.A.evaluateGradient(this.GradA*this.Grad);
            this.B.evaluateGradient(this.GradB*this.Grad);
            // console.log("Grad evaled")
        }
    }
    uncache() {
        this.NumOutputs = 0;
        this.NumGrad = 0;
        this.Grad = 0;
        this.Cached = false;
        this.GradCached = false;
        this.A.uncache();
        this.B.uncache();
    }
    getInputs() {
        return this.A.getInputs().union(this.B.getInputs());
    }
}
class NOT extends InputBit {
    constructor(a) {
        super();
        if (a) {
            this.A = a;
        } else {
            this.A = new InputBit();
        }
        this.Cached = false;
    }
    evaluate() {
        if (this.Cached && this.A.Cached) {
            return this.Out;
        } else {
            this.set(1-this.A.evaluate());
            this.Cached = true;
            return this.Out;
        }
    }
    uncache() {
        this.NumOutputs = 0;
        this.NumGrad = 0;
        this.Cached = false;
        this.GradCached = false;
        this.A.uncache();
    }
    gradient() {
        if (this.GradCached) {
            this.NumOutputs++;
            return [-1];
        } else {
            this.GradCached = true;
            this.NumOutputs = 1;
            this.A.gradient();
            return [-1];
        }
    }
    evaluateGradient(g) {
        if (!this.GradCached) {
            this.gradient();
        }
        this.NumGrad++;
        this.Grad += g;
        if (this.NumGrad >= this.NumOutputs) {
            this.A.evaluateGradient(-this.Grad);
            // console.log("Grad evaled")
        }
    }
    getInputs() {
        return this.A.getInputs();
    }
}
class AND extends OptimizableGateUnit {
    constructor(a,b) {
        super(a,b);
        this.GateStrengths.fill(0);
        this.GateStrengths[8] = 1;
    }
}
class OR extends OptimizableGateUnit {
    constructor(a,b) {
        super(a,b);
        this.GateStrengths.fill(0);
        this.GateStrengths[14] = 1;
    }
}
class XOR extends OptimizableGateUnit {
    constructor(a,b) {
        super(a,b);
        this.GateStrengths.fill(0);
        this.GateStrengths[6] = 1;
    }
}

class SAT_Solver {
    constructor(bit,options) {
        this.Bit = bit;
        this.Parameters = Array.from(this.Bit.getInputs());
        if (options) {
            this.options = options;
        } else {
            this.options = {
                optimizer:"Newton",
                maxiter: 20000,
                lr: 1.2
            }
        }
    }
    gradLength2() {
        var result = 0;
        for (var i=0; i<this.Parameters.length; i++) {
            result += this.Parameters[i].evaluate()**2;
        }
        // result /= this.Parameters.length;
        // result /= this.Parameters.length*this.Parameters.length;
        // console.log(result);
        return result;
        // return result/this.Parameters.length;
    }
    step(m) {
        for (var i=0; i<this.Parameters.length; i++) {
            this.Parameters[i].step(m);
        }
    }
    iterate(f) {
        if (this.options.lr.constructor != Number) {
            throw new Error("Learning rate is not a number")
        }
        var loss = this.Bit.evaluate();
        this.Bit.evaluateGradient(1);
        if (f) {
            f();
        }
        switch (this.options.optimizer.toLowerCase()) {
            case "sgd":
                this.step(this.options.lr)
                break;
            case "newton":
                // var mplyer = -Math.log2(loss)/this.gradLength2();
                var mplyer = 1/(loss*this.gradLength2());
                // var mplyer = 1/loss;
                this.step(this.options.lr*mplyer)
                break;
            default:
                throw new Error("Optimizer is not specified")
        }
        this.Bit.uncache();
        return loss
    }
    result() {
        return this.Parameters.map(function(v){return v.evaluate()})
    }
    collapse() {
        for (var i=0; i<this.Parameters.length; i++) {
            this.Parameters[i].collapse();
        }
    }
    collapseRandom() {
        for (var i=0; i<this.Parameters.length; i++) {
            this.Parameters[i].collapseRandom();
        }
    }
    solve(f) {
        var iter = 0;
        var loss = this.Bit.evaluate();
        while (loss < 0.999 && iter < this.options.maxiter) {
            loss = this.iterate(f);
            // console.clear();
            // console.log(-Math.log2(loss));
            // var res = this.result();
            // console.log(res);
            // console.log(res.join("\t"));
            // console.log(res.map(Math.round).join(""))
            iter++;
        }
        this.collapse();
        this.Bit.uncache();
        if (this.Bit.evaluate() != 1) {
            console.log("NOT SOLVED!");
        }
        return {result:this.result(),iterations:iter};
    }
}


// var Answer = new Array(4096).fill("").map(function(){return Math.round(Math.random())}).join("");
// if (Answer[0] == "1") {
//     var V = [new InputBit()];
// } else {
//     var V = [new NOT()];
// }
// for (var i=1; i<Answer.length; i++) {
//     if (Answer[i] == "1") {
//         V.push(new AND(V[V.length-1]));
//     } else {
//         V.push(new AND(V[V.length-1],new NOT()));
//         // V.push(new NOT(new AND(new NOT(V[V.length-1]))));
//     }
// }
// var O = V[V.length-1];
// // Newton
// // SGD
// var solver = new SAT_Solver(O,{
//     optimizer:"Newton",
//     maxiter: 20000,
//     lr: 1,
// });
// var solution = solver.solve();
// var reslt = solution.result.map(Math.round).join("");
// console.log(solution.iterations);
// console.log(Answer);
// console.log(reslt);
// console.log(reslt == Answer)



function HalfAdder(a,b) {
    if (!a) {
        a = new InputBit();
    }
    if (!b) {
        b = new InputBit();
    }
    return [new XOR(a,b),new AND(a,b)]
}
function FullAdder(a,b,c) {
    if (!a) {
        a = new InputBit();
    }
    if (!b) {
        b = new InputBit();
    }
    if (!c) {
        c = new InputBit();
    }
    var v0 = HalfAdder(a,b);
    var v1 = HalfAdder(v0[0],c);
    return [v1[0],new OR(v0[1],v1[1])];
}
function AdderArray(a,b) {
    var Out = [];
    if (a.length < b.length) {
        var Atmp = a;
        a = b;
        b = Atmp;
    }
    var tmp = HalfAdder(a[0],b[0]);
    Out.push(tmp[0])
    for (var i=1; i<b.length; i++) {
        tmp = FullAdder(a[i],b[i],tmp[1]);
        Out.push(tmp[0])
    }
    for (var i=b.length; i<a.length; i++) {
        tmp = HalfAdder(a[i],tmp[1]);
        Out.push(tmp[0])
    }
    Out.push(tmp[1])
    return Out;
}
function multConv(a,b) {
    var res = [];
    for (var x=0; x<a.length; x++) {
        var row = [];
        for (var y=0; y<b.length; y++) {
            row.push(new AND(a[x],b[y]));
        }
        res.push(row);
    }
    return res;
}
function multiplyArr(a,b) {
    var conv = multConv(a,b);
    var result = [];
    var val = conv[0];
    result.push(val[0])
    for (var i=1; i<conv.length; i++) {
        val = AdderArray(val.slice(1),conv[i])
        result.push(val[0])
    }
    result = [result,val.slice(1)].flat();
    return result;
}
function equals(a,b) {
    if (a.length != b.length) {
        console.log(a.length,b.length)
        throw new Error("Not the same");
    }
    if (a.length == 1) {
        if (b[0] >= 0.5) {
            return a[0]
        } else {
            return new NOT(a[0])
        }
    } else {
        return new AND(equals(a.slice(0,a.length>>1),b.slice(0,b.length>>1)),equals(a.slice(a.length>>1),b.slice(a.length>>1)));
    }
}
function intToBits(n,l) {
    var arr = [];
    for (var i=0; i<l; i++) {
        arr.push(n&1);
        n >>= 1;
    }
    return arr;
}
function intToInBits(n) {
    var arr = [];
    while (n > 0) {
        var b = n&1;
        b = ((b-0.5)*0.5)+0.5;
        arr.push(new InputBit(b));
        n >>= 1;
    }
    return arr;
}
function BitArrToNum(ar) {
    return Number("0b"+ar.map(function(v){return Math.round(v.evaluate())}).reverse().join(""))
}

// var Test = [10,15];
// console.log(Number("0b"+multiplyArr(intToInBits(Test[0]),intToInBits(Test[1])).map(function(v){return Math.round(v.evaluate())}).reverse().join("")))
// console.log(Test[0]*Test[1]);

var Test = [17,13];
var N = Test[0]*Test[1];

// var A = intToInBits(Test[0]);
// var B = intToInBits(Test[1]);
// console.log(BitArrToNum(A));
// console.log(BitArrToNum(B));


var A = [new InputBit(1)];
var B = [new InputBit(1)];
var bitnum = Math.ceil(Math.log2(N)*0.7);
console.log(bitnum);
for (var i=1; i<bitnum; i++) {
    // A.push(new InputBit(Math.random()))
    // B.push(new InputBit(Math.random()))

    // A.push(new InputBit(((Math.random()-0.5)*0.5)+0.5));
    // B.push(new InputBit(((Math.random()-0.5)*0.5)+0.5));

    A.push(new InputBit(0.9));
    B.push(new InputBit(0.5));
}
var OutN = multiplyArr(A,B);
var lss = equals(OutN,intToBits(N,OutN.length));
// Newton
// SGD
var solver = new SAT_Solver(lss,{
    optimizer:"Newton",
    maxiter: 2000,
    lr: 0.1,
});
var solution = solver.solve(function(){
    // console.log(A.map(function(v){return v.Grad}));
    // console.log(B.map(function(v){return v.Grad}));
    var t = [BitArrToNum(A),BitArrToNum(B)];
    console.clear();
    console.log(t[0],Test[0]);
    console.log(t[1],Test[1]);
    console.log(t[0]*t[1],N);
});
// var solution = solver.solve();
var reslt = solution.result.map(Math.round).join("");
console.log(solution.iterations);
console.log("------------------------------");
var G = [BitArrToNum(A),BitArrToNum(B)]
console.log(G[0]);
console.log(G[1]);
console.log("");
console.log((G[0]*G[1])+"\t"+N);