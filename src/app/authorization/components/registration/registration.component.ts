import {Component, DestroyRef, Inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {passwordMatchValidator} from "../../../validators/auth.validator";
import {
    IRegistrationRequestModel
} from "../../../data/request-models/auth/IRegistration.request-model";
import {PolymorpheusContent} from "@tinkoff/ng-polymorpheus";
import {TuiDialogContext, TuiDialogService, TuiDialogSize} from "@taiga-ui/core";
import {Observable} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TuiDialogFormService} from "@taiga-ui/kit";
import {AuthService} from "../../../data/services/auth.service";
import {Router} from "@angular/router";
import {IdentityService} from "../../../data/services/identity.service";

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrl: '../../styles/authorization-styles.scss'
})
export class RegistrationComponent {
    protected formRegistration: FormGroup = new FormGroup({
        email: new FormControl("", [Validators.required, Validators.email]),
        password: new FormControl("", [Validators.required, Validators.minLength(6), Validators.maxLength(15)]),
        repeatPassword: new FormControl("", [Validators.required, Validators.minLength(6), Validators.maxLength(15)])
    }, {validators: passwordMatchValidator});

    constructor(
        @Inject(TuiDialogFormService)
        private readonly _dialogForm: TuiDialogFormService,
        @Inject(TuiDialogService)
        private readonly _dialogs: TuiDialogService,
        private _identityService: IdentityService,
        private _destroyRef: DestroyRef,
        private _router: Router,
    ) {
    }

    public openDialogRegistration(
        registration: PolymorpheusContent<TuiDialogContext>,
        size: TuiDialogSize,
    ): void {
        const closeable: Observable<boolean> = this._dialogForm.withPrompt({
            label: 'Вы уверены?',
            data: {
                content: 'Ваши данные будут <strong>потеряны</strong>',
            },
        });

        this._dialogs.open(
            registration,
            {
                size,
                data: {button: 'Зарегистрироваться'},
                closeable,
                dismissible: closeable
            })
            .pipe(
                takeUntilDestroyed(this._destroyRef)
            )
            .subscribe({
                complete: () => {
                    this.formRegistration.reset();
                    this._dialogForm.markAsPristine();
                },
            });
    }

    public registrationNewUser(): void {
        const email = this.formRegistration.get('email')?.value;
        const password = this.formRegistration.get('password')?.value;

        if (email && password) {
            const user: IRegistrationRequestModel = {email, password};

            this._identityService.registerWithEmailAndPassword(user).subscribe(
                (data : boolean): void => {
                    if (data) {
                        console.log('Registered successfully');
                        this._dialogForm.markAsDirty();
                    }
                }
            );
        } else {
            console.error('Email and password are required');
        }
    }
}
