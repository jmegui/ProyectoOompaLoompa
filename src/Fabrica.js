import * as THREE from '../libs/three.module.js'
 
class Fabrica extends THREE.Object3D {
  constructor() {
    super();

    var boxGeom = new THREE.BoxBufferGeometry (20,15,20);
    var cartelFabrica = new THREE.BoxBufferGeometry(7,4,0.1);
    var cilin = new THREE.CylinderBufferGeometry(2,3,60,20,20,false);
    var portonGEO = new THREE.BoxBufferGeometry(7,7,0.1);
    var tejadoGEO = new THREE.Buffer

    var loader = new THREE.TextureLoader();
    var textura = loader.load("./imgs/texturaFabrica.jpg");
    var texturaTorre = loader.load("./imgs/ladrillo-difuso.png");
    var texturaCartel = loader.load("./imgs/cartel.png")
    var texturaPorton = loader.load("./imgs/porton.jpg");
    // Como material se crea uno a partir de un color
    var boxMat = new THREE.MeshPhongMaterial({map: textura});
    var TorMat = new THREE.MeshPhongMaterial({map: texturaTorre});
    var carMat = new THREE.MeshPhongMaterial({map: texturaCartel});
    var porMat = new THREE.MeshPhongMaterial({map: texturaPorton});
    
    
    // Ya podemos construir el Mesh
    var box = new THREE.Mesh (boxGeom, boxMat);
    var cilindro = new THREE.Mesh(cilin,TorMat);
    var cilindro2 = new THREE.Mesh(cilin,TorMat);
    var cilindro3 = new THREE.Mesh(cilin,TorMat);
    var cartel = new THREE.Mesh(cartelFabrica,carMat);
    var porton = new THREE.Mesh(portonGEO,porMat);
    // Y añadirlo como hijo del Object3D (el this)
    this.add (box);
    this.add (cilindro);
    this.add (cilindro2);
    this.add (cilindro3);
    this.add(cartel);
    this.add(porton);
    
    cartel.rotateY(Math.PI/2);
    cartel.position.y = 10;
    cartel.position.x = -9;

    porton.rotateY(Math.PI/2);
    porton.position.y = 3.5;
    porton.position.x = -9;

    box.position.y = 5;
    box.position.x = 1;
    cilindro.position.x = 13;
    cilindro3.position.x = 13;
    cilindro2.position.x = 13;
    cilindro.position.z = -7;
    cilindro2.position.z = 7;

  
    //Almacenamos el porcentaje de vida de la fabrica
    this.vida = 500;

  }
  
  // ******* ******* ******* ******* ******* ******* ******* 
  
  
  update () {
  }





}



export { Fabrica };
