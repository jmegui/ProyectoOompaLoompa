import * as THREE from '../libs/three.module.js'
 
class Fabrica extends THREE.Object3D {
  constructor() {
    super();

    var boxGeom = new THREE.BoxBufferGeometry (10,10,10);

    var loader = new THREE.TextureLoader();
    var textura = loader.load("./imgs/ladrillo-bump.png");
    // Como material se crea uno a partir de un color
    var boxMat = new THREE.MeshPhongMaterial({map: textura});
    
    // Ya podemos construir el Mesh
    var box = new THREE.Mesh (boxGeom, boxMat);
    // Y añadirlo como hijo del Object3D (el this)
    this.add (box);

    box.position.y = 5;
  
    //Almacenamos el porcentaje de vida de la fabrica
    this.vida = 500;

  }
  
  // ******* ******* ******* ******* ******* ******* ******* 
  
  
  update () {
  }





}



export { Fabrica };
