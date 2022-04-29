import * as THREE from './libs/three.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
 
class Jugador extends THREE.Object3D {
  constructor(gui,titleGui,rend) {
    super();

    this.clock = new THREE.Clock();
    
    // Se crea la parte de la interfaz que corresponde a la caja
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui,titleGui,rend);

    //
    this.renderer = rend;

    //Valores posicion
    this.vertical = new THREE.Vector3(0,1,0);
    this.frente = new THREE.Vector3(1,0,0);
    this.cantidadAvance = 12;

    //Almacena inclinacion cabeza
    this.inclinacion = 0;
    
    this.createCameraPrimeraPersona();

  }

  createCameraPrimeraPersona(){

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // También se indica dónde se coloca
    this.camera.position.set (0, 3, 0);
    // Y hacia dónde mira
    this.look = new THREE.Vector3 (1,3,0);
    this.camera.lookAt(this.look);
    this.add (this.camera);
  }

  avanzar(avanza){
    var direccion = this.dt*this.cantidadAvance;
    if(!avanza) direccion = -this.dt*this.cantidadAvance;

    this.translateOnAxis (this.frente, direccion);
  }
  
  lateral(derecha){
    var direccion = -this.dt*this.cantidadAvance;
    if(derecha) direccion = this.dt*this.cantidadAvance;

    this.translateOnAxis (new THREE.Vector3(0,0,1), direccion);
  }

  girarCamara(x,y){
    this.rotateOnAxis (this.vertical, -x/500);

    //Limita el giro de la cabeza hacia arriba y abajo
    if((y<0 && this.inclinacion>(-90*Math.PI/180)) || (y>0 && this.inclinacion<(90*Math.PI/180))){
      this.inclinacion += y/500;
      this.camera.rotateOnAxis(this.frente,-y/500);
      console.log(this.inclinacion);
    }
  }

  getCamera(){
    return this.camera;
  }
  
  createGUI (gui,titleGui) {
  }
  
  update () {
    this.dt = this.clock.getDelta();
  }
}

export { Jugador };
