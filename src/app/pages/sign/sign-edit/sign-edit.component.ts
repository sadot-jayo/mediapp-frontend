import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from 'src/app/model/patient';
import { PatientService } from 'src/app/service/patient.service';
import { SignService } from 'src/app/service/sign.service';
import { map, Observable, switchMap } from 'rxjs';
import { Sign } from 'src/app/model/sign';

@Component({
  selector: 'app-sign-edit',
  templateUrl: './sign-edit.component.html',
  styleUrls: ['./sign-edit.component.css']
})
export class SignEditComponent implements OnInit {

  patientSelected:Patient
  patientControl: FormControl = new FormControl();
  patientsFiltered$: Observable<Patient[]>;
  patients: Patient[];

  id: number;
  isEdit: boolean;
  form: FormGroup;
  //patients$: Observable<Patient[]>;
  minDate: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signService: SignService,
    private patientService: PatientService,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'idSign': new FormControl(0),
      'patient': this.patientControl,
      'signDate': new FormControl('', [Validators.required]),
      'temperature': new FormControl('', [Validators.required]),
      'pulse': new FormControl('', [Validators.required, Validators.minLength(3)]),
      'respiratoryRate': new FormControl('', [Validators.required, Validators.minLength(3)])
    });

    this.getInitialData();

    this.route.params.subscribe(data => {
      this.id = data['id'];
      this.isEdit = data['id'] != null;
      this.initForm();
    });

    this.patientsFiltered$ = this.patientControl.valueChanges.pipe(map(val => this.filterPatients(val)));

  }

  getInitialData(){
    //this.patients$ = this.patientService.findAll();
    this.patientService.findAll().subscribe(data => this.patients = data);
  }

  initForm() {
    if (this.isEdit) {

      this.signService.findById(this.id).subscribe(data => {
        //const p: Patient = data.patient;

        this.form = new FormGroup({
          'idSign': new FormControl(data.idSign),
          'patient': this.patientControl,
          'signDate': new FormControl(data.signDate, [Validators.required]),
          'temperature': new FormControl(data.temperature, [Validators.required]),
          'pulse': new FormControl(data.pulse, [Validators.required, Validators.minLength(3)]),
          'respiratoryRate': new FormControl(data.respiratoryRate, [Validators.required, Validators.minLength(3)])
        });
        this.form.get('patient').setValue(data.patient);

      });
    }
  }

  get f() {
    return this.form.controls;
  }

  filterPatients(val: any){
    if (val?.idPatient > 0) {
      return this.patients.filter(el =>
        el.firstName.toLowerCase().includes(val.firstName.toLowerCase()) || el.lastName.toLowerCase().includes(val.lastName.toLowerCase()) || el.dni.includes(val)
      )
    } else {
      return this.patients.filter(el =>
        el.firstName.toLowerCase().includes(val?.toLowerCase()) || el.lastName.toLowerCase().includes(val?.toLowerCase()) || el.dni.includes(val)
      );
    }
  }

  showPatient(val: any){
    return val ? `${val.firstName} ${val.lastName}` : val;
  }

  operate() {
    if (this.form.invalid) { return; }

    let sign = new Sign();
    sign.idSign = this.form.value['idSign'];
    sign.patient = this.form.value['patient'];
    sign.signDate = this.form.value['signDate'];
    sign.temperature = this.form.value['temperature'];
    sign.pulse = this.form.value['pulse'];
    sign.respiratoryRate = this.form.value['respiratoryRate'];


    if (this.isEdit) {
      //UPDATE
      //PRACTICA COMUN
      this.signService.update(sign, sign.idSign).subscribe(() => {
        this.signService.listPageable(0, 2).subscribe(data => {
          this.signService.setSignChange(data);
          this.signService.setMessageChange('UPDATED!')
        });
      });
    } else {
      //INSERT
      //PRACTICA IDEAL
      this.signService.save(sign).pipe(switchMap(()=>{
        return this.signService.listPageable(0, 2);
      }))
      .subscribe(data => {
        this.signService.setSignChange(data);
        this.signService.setMessageChange("CREATED!")
      });
    }
    this.router.navigate(['/pages/sign']);
  }

}
