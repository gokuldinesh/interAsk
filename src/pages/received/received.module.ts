import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceivedPage } from './received';

@NgModule({
  declarations: [
    ReceivedPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceivedPage)
  ],
})
export class ReceivedPageModule {}
