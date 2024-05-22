import {ChangeDetectionStrategy, Component, DestroyRef, ViewChild} from '@angular/core';
import {Capacitor, CapacitorGlobal} from "@capacitor/core";
import { BehaviorSubject } from 'rxjs';
import { CardModel } from '../../../../data/models/card/card.model';
import { OperationModel } from '../../../../data/models/operation/operation.model';
import { TuiHostedDropdownComponent } from '@taiga-ui/core';
import { OperationManagerService } from '../../../../data/services/operation/operation.manager.service';
import { CardManagerService } from '../../../../data/services/card/card.manager.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrl: './styles/user.master.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
    private _userId: string = localStorage.getItem('uid')!;

    private _cards = new BehaviorSubject<CardModel[]>([]);
    private _operations = new BehaviorSubject<OperationModel[]>([
        new OperationModel({
            cardId: '',
            name: 'Операций по этой карте еще не было',
            category: '',
            amount: 0,
            dateTimestamp: 0
        }, '')
    ]);
    
    protected cards$ = this._cards.asObservable();
    protected operations$ = this._operations.asObservable();

    
    
    protected selectedCard!: CardModel;
    protected open = false;
    
    @ViewChild(TuiHostedDropdownComponent) component?: TuiHostedDropdownComponent;
    
    constructor(
        private _operationService: OperationManagerService,
        private _cardService: CardManagerService,
        private _destroyRef: DestroyRef,
    ){
        this._cardService.getAll(this._userId)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((data:CardModel[]) =>
        {
            this._cards.next(data);
            this.selectedCard = this._cards.getValue()[0];
            this._operationService.getAll(this._userId, this.selectedCard.cardId)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe((data:OperationModel[])=>{
                if(data.length === 0){
                    this._operations.next([
                        new OperationModel({
                            cardId: '',
                            name: 'Операций по этой карте еще не было',
                            category: '',
                            amount: 0,
                            dateTimestamp: 0
                        }, '')]);
                }
                else{
                    this._operations.next(data);
                }
            })
        })
    }
    protected showInfoAboutCard(card:CardModel):void{
        this.selectedCard = card;
        this._operationService.getAll(this._userId, this.selectedCard.cardId)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((data:OperationModel[])=>{
            if(data.length === 0){
                this._operations.next([
                    new OperationModel({
                        cardId: '',
                        name: 'Операций по этой карте еще не было',
                        category: '',
                        amount: 0,
                        dateTimestamp: 0
                    }, '')]);
            }
            else{
                this._operations.next(data);
                console.log(this._operations);
            }
        })
    }

    protected readonly Capacitor: CapacitorGlobal = Capacitor;
    protected readonly window: Window = window;
}
