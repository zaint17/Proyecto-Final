import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicketEventsService {
  private _ticketCreado = new Subject<void>();
  ticketCreado$ = this._ticketCreado.asObservable();

  emitirTicketCreado() {
    this._ticketCreado.next();
  }
}