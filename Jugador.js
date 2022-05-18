import * as THREE from './libs/three.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
import * as TWEEN from '../libs/tween.esm.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import { OBJLoader } from '../libs/OBJLoader.js' 
 
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

    //Administrar salto
    this.saltando = false;
    this.direccionAlmacenada = {a:0,l:0};
    
    this.createCameraPrimeraPersona();

    //Carga el modelo de la pistola
    var materialLoader = new MTLLoader();
    var objectLoader = new OBJLoader();
    materialLoader.load('/models/pistola/11684_gun_v1_l3.mtl',
        ( materials ) => {
          objectLoader.setMaterials(materials);
          objectLoader.load ('/models/pistola/11684_gun_v1_l3.obj',
            (object) => {
              this.pistola = object;
              this.pistola.rotateOnAxis(new THREE.Vector3(0,1,0),Math.PI);
              this.pistola.rotateOnAxis(new THREE.Vector3(1,0,0),-90*Math.PI/180);
              this.pistola.scale.x=0.1;
              this.pistola.scale.y=0.1;
              this.pistola.scale.z=0.1;
              this.pistola.position.x += 2; 
              this.pistola.position.y += 1;
              this.pistola.position.z += 1;
              this .add (this.pistola) ;
            }, null, null);
          });
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

  avanzar(adelante,derecha){
    if(!this.saltando){
      if(adelante && derecha){
        var distancia = Math.sqrt(2*this.cantidadAvance*this.cantidadAvance);
        this.translateOnAxis (this.frente, this.dt*(adelante*distancia/2));
        this.translateOnAxis (new THREE.Vector3(0,0,1), this.dt*(derecha*distancia/2));
      }

      else if(derecha)
        this.translateOnAxis (new THREE.Vector3(0,0,1), this.dt*(this.cantidadAvance*derecha));

      else if(adelante)
        this.translateOnAxis (this.frente, this.dt*(this.cantidadAvance*adelante));
  
    }
  }

  girarCamara(x,y){
    this.rotateOnAxis (this.vertical, -x/500);

    //Limita el giro de la cabeza hacia arriba y abajo
    if((y<0 && this.inclinacion>(-90*Math.PI/180)) || (y>0 && this.inclinacion<(90*Math.PI/180))){
      this.inclinacion += y/500;
      this.camera.rotateOnAxis(this.frente,-y/500);
      this.pistola.rotateOnAxis(new THREE.Vector3(0,1,0),-y/500);
    }
  }

  getCamera(){
    return this.camera;
  }

  saltar(adelante,atras,derecha,izquierda){
    if(!this.saltando){
      this.saltando = true;

      if(adelante) this.direccionAlmacenada.a = 1;
      else if(atras) this.direccionAlmacenada.a = -1;

      if(derecha) this.direccionAlmacenada.l = 1;
      else if(izquierda) this.direccionAlmacenada.l = -1;

      var origen = {y: this.position.y}; 
      var destino = {y: this.position.y+2};
      var suelo = {y: this.position.y}; 

      var caer=new TWEEN.Tween(destino).to(suelo,300).easing(TWEEN.Easing.Quadratic.In).onComplete(()=>{this.saltando = false;this.direccionAlmacenada={a:0,l:0};});

      var saltar=new TWEEN.Tween(origen).to(destino,300).easing(TWEEN.Easing.Quadratic.Out).chain(caer);

      saltar.onUpdate ( ( ) =>{
        this.position.y = origen.y;
      });

      caer.onUpdate ( ( ) =>{
        this.position.y = destino.y;
      });

      saltar.start();
    }
  }
  
  createGUI (gui,titleGui) {
  }
  
  update (pausa) {
    this.dt = this.clock.getDelta();

    if(!pausa){
      TWEEN.update();
      //Si estoy saltando aplico el desplazamiento almacenado
      if(this.saltando){
        if(this.direccionAlmacenada.a && this.direccionAlmacenada.l){
          var distancia = Math.sqrt(this.cantidadAvance*this.cantidadAvance);
          this.translateOnAxis (this.frente, this.dt*(this.direccionAlmacenada.a*distancia/2));
          this.translateOnAxis (new THREE.Vector3(0,0,1), this.dt*(this.direccionAlmacenada.l*distancia/2));
        }

        else if(this.direccionAlmacenada.l)
          this.translateOnAxis (new THREE.Vector3(0,0,1), this.dt*(this.cantidadAvance*this.direccionAlmacenada.l));

        else if(this.direccionAlmacenada.a)
          this.translateOnAxis (this.frente, this.dt*(this.cantidadAvance*this.direccionAlmacenada.a));
      }
    }
  }
}

export { Jugador };
