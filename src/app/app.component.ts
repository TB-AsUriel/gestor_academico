import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  alertCircleOutline,
  arrowForwardOutline,
  bookOutline,
  calendarClearOutline,
  calendarOutline,
  closeOutline,
  cloudOfflineOutline,
  createOutline,
  documentsOutline,
  eyeOffOutline,
  eyeOutline,
  locationOutline,
  lockClosedOutline,
  logOutOutline,
  mailOutline,
  moonOutline,
  peopleOutline,
  personOutline,
  refreshOutline,
  schoolOutline,
  searchOutline,
  shieldCheckmarkOutline,
  sunnyOutline,
  timeOutline,
  trashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    addIcons({
      addOutline,
      alertCircleOutline,
      arrowForwardOutline,
      bookOutline,
      calendarClearOutline,
      calendarOutline,
      closeOutline,
      cloudOfflineOutline,
      createOutline,
      documentsOutline,
      eyeOffOutline,
      eyeOutline,
      locationOutline,
      lockClosedOutline,
      logOutOutline,
      mailOutline,
      moonOutline,
      peopleOutline,
      personOutline,
      refreshOutline,
      schoolOutline,
      searchOutline,
      shieldCheckmarkOutline,
      sunnyOutline,
      timeOutline,
      trashOutline
    });
  }
}
