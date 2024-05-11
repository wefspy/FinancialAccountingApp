import {ChangeDetectionStrategy, Component} from '@angular/core';
import {StateBarService} from "../../services/state-bar/state-bar.service";

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrl: './styles/sidebar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent extends StateBarService {
}
