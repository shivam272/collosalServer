import faker from "faker";

//we will use interface to implement DRY.
interface Mappable {
  coordinates: {
    lat: number;
    lng: number;
  };
  markerContent(): string;
  color: string;
}

class User implements Mappable {
  name: string;
  color: string = "blue";
  coordinates: {
    lat: number;
    lng: number;
  };

  constructor() {
    this.name = faker.name.firstName() + faker.name.lastName();
    this.coordinates = {
      lat: parseFloat(faker.address.latitude()),
      lng: parseFloat(faker.address.longitude()),
    };
  }

  markerContent(): string {
    return `<div style="color:${this.color}">User name is <b>${this.name}</b></div>`;
  }
}

class Company implements Mappable {
  companyName: string;
  companyPhrase: string;
  color: string = "red";
  coordinates: {
    lat: number;
    lng: number;
  };

  constructor() {
    this.companyName = faker.company.companyName();
    this.companyPhrase = faker.company.catchPhrase();
    this.coordinates = {
      lat: parseFloat(faker.address.latitude()),
      lng: parseFloat(faker.address.longitude()),
    };
  }
  //we are passing html here.
  markerContent(): string {
    return `<div style="color:${this.color}">this is the company <b>${this.companyName}</b> 
    with phrase is <b> ${this.companyPhrase}</b></div>
    `;
  }
}

const divElement = document.getElementById("wrapper");
const userOne = new User();
const companyOne = new Company();

class CustomMap {
  private googleMap: google.maps.Map;
  propOne: string;
  constructor(divElement: HTMLElement) {
    this.propOne = "propOne";
    this.googleMap = new google.maps.Map(divElement, {
      zoom: 1,
      center: { lat: 0, lng: 1 },
    });
  }

  addMarker(mappable: Mappable): void {
    const marker = new google.maps.Marker({
      map: this.googleMap,
      position: {
        lat: mappable.coordinates.lat,
        lng: mappable.coordinates.lng,
      },
    });

    marker.addListener("click", () => {
      const infoWindow = new google.maps.InfoWindow({
        content: `${mappable.markerContent()} and ${this.propOne}`,
      });
      infoWindow.open(this.googleMap, marker);
    });
  }
}

interface Location {
  lat: number;
  lng: number;
}

const obj = { name: "df", age: 34, location: { lat: 23.43, lng: 45.65 } };
const data = obj.location as Location;


const customMap = new CustomMap(divElement);
customMap.addMarker(userOne);
customMap.addMarker(companyOne);
