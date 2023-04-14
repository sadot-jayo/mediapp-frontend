import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Sign } from 'src/app/model/sign';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SignService } from 'src/app/service/sign.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css']
})
export class SignComponent implements OnInit {

  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'temperature', 'pulse', 'respiratoryRate', 'actions'];
  dataSource: MatTableDataSource<Sign>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  totalElements: number;

  constructor(
    private route: ActivatedRoute,
    private signService: SignService,
    private _snackBar: MatSnackBar
    ){

    }

  ngOnInit(): void {

    this.signService.getSignChange().subscribe(data => {
      this.createTable(data);
    });

    this.signService.getMessageChange().subscribe(data => {
      this._snackBar.open(data, 'INFO', {duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'});
    });

    this.signService.listPageable(0, 2).subscribe(data => {
      this.createTable(data);
    });

  }

  applyFilter(e: any){
    this.dataSource.filter = e.target.value.trim().toLowerCase();
  }

  createTable(data: any){
    this.dataSource = new MatTableDataSource(data.content);
    this.totalElements = data.totalElements;

    this.dataSource.filterPredicate = (data: any, filter) => {
      const dataStr =JSON.stringify(data).toLowerCase();
      return dataStr.indexOf(filter) != -1;
    }

    // this.dataSource.filterPredicate = (data: any, filter: string) => {
    //   return data.patient.firstName.toLocaleLowerCase().includes(filter);
    // };
  }

  delete(idSign: number){
    this.signService.delete(idSign).pipe(switchMap( ()=>{
      return this.signService.listPageable(0, 2);
    }))
    .subscribe(data => {
      this.signService.setSignChange(data);
      this.signService.setMessageChange("DELETED!");
    });
    ;
  }

  showMore(e: any){
    this.signService.listPageable(e.pageIndex, e.pageSize).subscribe(data => {
      this.createTable(data);
    });
  }

  checkChildren(): boolean{
    return this.route.children.length != 0;
  }

}
