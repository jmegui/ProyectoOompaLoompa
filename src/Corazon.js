import * as THREE from '../libs/three.module.js'
 
class Corazon extends THREE.Object3D {
  constructor() {
    super();
    
    // Se crea la parte de la interfaz que corresponde a la caja
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz

    var shape = new THREE.Shape();

    
    shape.moveTo( 25, 25 );
    shape.bezierCurveTo( 25, 25, 20, 0, 0, 0 );
    shape.bezierCurveTo( - 30, 0, - 30, 35, - 30, 35 );
    shape.bezierCurveTo( - 30, 55, - 10, 77, 25, 95 );
    shape.bezierCurveTo( 60, 77, 80, 55, 80, 35 );
    shape.bezierCurveTo( 80, 35, 80, 0, 50, 0 );
    shape.bezierCurveTo( 35, 0, 25, 25, 25, 25 );

    const extrudeSettings = { depth: 10, bevelEnabled: true, bevelSegments: 9, steps: 8, bevelSize: 10, bevelThickness: 10 };

    var BarridoGeom = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    // Como material se crea uno a partir de un color
    var BarridoMat = new THREE.MeshPhongMaterial({color: 0xCF0000});
    // Ya podemos construir el Mesh
    var barrido = new THREE.Mesh (BarridoGeom, BarridoMat);


    this.add (barrido);

    
    // Las geometrías se crean centradas en el origen.
    // Como queremos que el sistema de referencia esté en la base,
    // subimos el Mesh de la caja la mitad de su altura
    this.rotateZ(Math.PI);
    this.scale.set(0.02,0.02,0.02);
    this.position.y = 3;
    this.position.x = 30;
  }
  

  
  update () {
    // Con independencia de cómo se escriban las 3 siguientes líneas, el orden en el que se aplican las transformaciones es:
    // Primero, el escalado
    // Segundo, la rotación en Z
    // Después, la rotación en Y
    // Luego, la rotación en X
    // Y por último la traslación

    this.rotation.y += 0.01;
  }
}

export { Corazon };