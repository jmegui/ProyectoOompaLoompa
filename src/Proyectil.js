import * as THREE from '../libs/three.module.js'
 
class Proyectil extends THREE.Object3D {
  constructor(origen,obj,robots, color) {
    super();

    /*-----------ATRIBUTOS-PARA-GESTIONAR-EVENTOS-------------*/
    this.clock = new THREE.Clock();
    this.origen = new THREE.Vector3(origen.x,origen.y,origen.z);
    this.objetivo = new THREE.Vector3(obj.x * 10000, obj.y * 10000  , obj.z * 10000);
    this.robots = robots;
    this.alcanzados = new Array(this.robots.length);//Almaceno los robots alcanzados a los que ya se les ha aplicado el daño de disparo
    this.distanciaTotal = this.getDistancia(this.position,this.objetivo);
    this.distanciaRecorrida = 0;

    /*------------------CREACION-GEOMETRIA--------------------*/
    var BarridoGeom = new THREE.TorusBufferGeometry(0.8,0.2,10,50);
    // Como material se crea uno a partir de un color
    var BarridoMat = new THREE.MeshToonMaterial({color: color, transparent:true, opacity:0.8});
    // Ya podemos construir el Mesh
    this.objeto = new THREE.Mesh (BarridoGeom, BarridoMat);

    this.add (this.objeto);

    this.position.x = this.origen.x
    this.position.z = this.origen.z;
    this.position.y = this.origen.y ;

    this.lookAt(this.objetivo);


  }

/*______________________________________________________________________________________________________________________*/
/*__________________________________________________ACCIONES____________________________________________________________*/
/*______________________________________________________________________________________________________________________*/

  //Calcula distancia entre dos puntos 3D
  getDistancia(inicio,fin){
      return Math.sqrt(Math.pow(inicio.x - fin.x, 2) + Math.pow(inicio.z - fin.z, 2) +  Math.pow(inicio.y - fin.y, 2));
  }
  
  //Comprueba si esta intersectando con un robot y en caso afirmativo le afecta el disparo
  intersecta(){
    for(var i=0; i<this.robots.length; i++){
      if(this.getDistancia(this.position,this.robots[i].position)<3 && !this.alcanzados[i]){
        this.robots[i].recibeDisparo();
        this.alcanzados[i] = true;
      }
    }
  }

  //Aproxima el proyectil al objetivo
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

    //Calcula altura
    this.position.y = this.origen.y + this.objetivo.y * this.getDistancia(this.origen,this.position)/this.distanciaTotal;
  }
  
  update () {
      this.aproximar(40 * this.clock.getDelta());
      this.distanciaRecorrida = this.getDistancia(this.origen,this.position);
      this.intersecta();
  }
}

export { Proyectil };
