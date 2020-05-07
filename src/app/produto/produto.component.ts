import { Component, OnInit, ɵConsole } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
// imports necessário para o select

import { ElectronService } from '../core/services/electron/electron.service';
import { ProdutoService } from './produto.service'




// tslint:disable-next-line: class-name
interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'CORREDIÇAS',
    children: [
      {
        name: 'telescópica',
        children: [
          {
            name: 'tn H45',
            children: [
              {name: '250MM'},
              {name: '300MM'},
              {name: '350MM'},
              {name: '400MM'},
              {name: '450MM'},
              {name: '500MM'},
              {name: '550MM'},
            ]
          }, {
            name: 'TN h35',
            children: [
              {name: '250MM'},
              {name: '300MM'},
              {name: '350MM'},
              {name: '400MM'},
              {name: '450MM'},
              {name: '500MM'},
              {name: '550MM'},
            ]
          },
        ]
      },
      {
        name: 'Invisivel',
        children: [
          {
            name: 'Tandem',
            children: [
              {name: '350MM'},
              {name: '400MM'},
              {name: '450MM'},
              {name: '500MM'},
              {name: '550MM'},
            ]
          }, 
        ]
      },
    ]
  }, {
    name: 'DOBRADIÇAS',
    children: [
      {
        name: 'fgv 110º',
        children: [
          {name: 'RETA'},
          {name: 'CURVA'},
          {name: 'SUPER ALTA'},
        ]
      }, 
    ]
  },
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}






@Component({
  selector: 'app-produto',
  templateUrl: './produto.component.html',
  styleUrls: ['./produto.component.scss']
})
export class ProdutoComponent implements OnInit {

  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
      node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);



  constructor(private produtoService: ProdutoService, public dialog: MatDialog, public electron: ElectronService) {
    this.dataSource.data = TREE_DATA;
  }
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  ngOnInit() {
    
  }

}