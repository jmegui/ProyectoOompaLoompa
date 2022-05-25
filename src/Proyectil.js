import * as THREE from '../libs/three.module.js'
 
class Proyectil extends THREE.Object3D {
  constructor(origen,obj,robot) {
    super();

    this.origen = new THREE.Vector3(origen.position.x,origen.position.y,origen.position.z);
    
    this.clock = new THREE.Clock();

    this.tiempo = 0;

    var BarridoGeom = new THREE.TorusBufferGeometry(0.8,0.2,10,50);
    // Como material se crea uno a partir de un color
    var BarridoMat = new THREE.MeshToonMaterial({color: 0xCF0000});
    // Ya podemos construir el Mesh
    this.objeto = new THREE.Mesh (BarridoGeom, BarridoMat);

    this.objetivo = obj

    this.robot = robot;

    this.efecto = false;

    this.add (this.objeto);




    this.distanciaRecorrida = 0;

    this.distanciaTotal = this.getDistancia(origen.position,this.objetivo)

    this.position.x = origen.position.x
    this.position.z = origen.position.z;
    this.position.y = origen.position.y + 2;

    this.lookAt(this.objetivo);


  }

  getDistancia(inicio,fin)
  {
      return Math.sqrt(Math.pow(inicio.x - fin.x, 2) + Math.pow(inicio.z - fin.z, 2));
  }
  
  intersecta(robot){
    return (this.getDistancia(this.position,robot.position)<2);
  }

  quitarVidaAlRobot()
  {
    if(!this.efecto)
    {
      this.robot.recibeDisparo();
      this.efecto = true;
    }

  }

  aproximar(velocidad)
  {
    if(Math.abs(this.objetivo.x - this.position.x) >= Math.abs(this.objetivo.z - this.position.z))
    {
      if(this.position.x < this.objetivo.x)
      {
        var x = this.position.x;
        this.position.x += velocidad;
        this.position.z = (((this.objetivo.z - this.position.z)/(this.objetivo.x - x)) * (this.position.x - x) + this.position.z);
      }
      else if(this.position.x == this.objetivo.x)
      {
          //this.position.z += dt;
      }
      else
      {
        var x = this.position.x;
        this.position.x -= velocidad;
        this.position.z = (((this.objetivo.z - this.position.z)/(this.objetivo.x - x)) * (this.position.x - x) + this.position.z);
      }
    }
    else
    {
      if(this.position.z < this.objetivo.z)
      {
        var z = this.position.z;
        this.position.z += velocidad;
        this.position.x = (((this.objetivo.x - this.position.x)/(this.objetivo.z - z)) * (this.position.z - z) + this.position.x);
      }
      else if(this.position.z == this.objetivo.z)
      {
          this.position.z += velocidad;
      }
      else
      {
        var z = this.position.z;
        this.position.z -= velocidad;
        this.position.x = (((this.objetivo.x - this.position.x)/(this.objetivo.z - z)) * (this.position.z - z) + this.position.x); }
    }
  }
  
  update () {
    // Con independencia de cómo se escriban las 3 siguientes líneas, el orden en el que se aplican las transformaciones es:
    // Primero, el escalado
    // Segundo, la rotación en Z
    // Después, la rotación en Y
    // Luego, la rotación en X
    // Y por último la traslación


      this.aproximar(30 * this.clock.getDelta());


      this.distanciaRecorrida = this.getDistancia(this.origen,this.position);


      // this.position.x += 50 * this.clock.getDelta();
      // this.position.z += 50 * this.clock.getDelta();

  }
}

export { Proyectil };
