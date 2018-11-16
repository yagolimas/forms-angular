import { DropdownService } from './../shared/services/dropdown.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { EstadoBr } from '../shared/models/estado-br.model';
import { Observable } from 'rxjs/Observable';
import { ConsultaCepService } from '../shared/services/consulta-cep.service';

@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.css']
})
export class DataFormComponent implements OnInit {

  form: FormGroup;

  estados: Observable<EstadoBr[]>;

  cargos: any[];

  tecnologias: any[];

  newsletterOp: any[];

  frameworks = ['Angular', 'React', 'Vue', 'Ember'];

  constructor(
    private formBuilder: FormBuilder,
    private http: Http,
    private dropdownService: DropdownService,
    private cepService: ConsultaCepService
  ) { }

  ngOnInit() {

    this.estados = this.dropdownService.getEstadosBr();

    this.cargos = this.dropdownService.getCargos();

    this.tecnologias = this.dropdownService.getTecnologias();

    this.newsletterOp = this.dropdownService.getNewsletter();

    /* this.dropdownService.getEstadosBr()
      .subscribe(dados => this.estados = dados ); */

    this.form = this.formBuilder.group({
      nome:  [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],

      endereco: this.formBuilder.group({
        cep: [null, [Validators.required]],
        numero: [null, [Validators.required]],
        complemento: [null, [Validators.required]],
        rua: [null, [Validators.required]],
        bairro: [null, [Validators.required]],
        cidade: [null, [Validators.required]],
        estado: [null, [Validators.required]]
      }),
      cargo: [null],
      tecnologias: [null],
      newsletter: ['s'],
      termos: [null],
      frameworks: this.buildFrameworks()
    });
  }

  onSubmit() {

    console.log(this.form.value);

    let valueSubmit = Object.assign({}, this.form.value);

    valueSubmit = Object.assign(valueSubmit, {
      frameworks: valueSubmit.frameworks
      .map((value, i) => value ? this.frameworks[i] : null)
      .filter(value => value !== null)
    });

    console.log(valueSubmit);

    if (this.form.valid) {

      this.http.post('https://httpbin.org/post', JSON.stringify({}))
        .subscribe(dados => {
          console.log(dados);
          // this.reset();
        },
        (error: any) => alert('error')
      );
    } else {
      this.verificaValidacoesForm(this.form);
    }
  }

  verificaValidacoesForm(formGroup: FormGroup) {
    const campos = formGroup.controls;

    Object.keys(campos).forEach(campo => {
      const control = formGroup.get(campo);
      control.markAsDirty();
      if (control instanceof FormGroup) {
        this.verificaValidacoesForm(control);
      }
    });
  }

  verificaValidTouched(campo: string) {

    return !this.form.get(campo).valid && (this.form.get(campo).touched || this.form.get(campo).dirty);

    // return !campo.valid && campo.touched;
  }

  verificaEmailInvalido() {

    const campoEmail = this.form.get('email');

    if (campoEmail.errors) {
      return campoEmail.errors['email'] && campoEmail.touched;
    }
  }

  aplicaCss(campo) {

    return {
      'has-error': this.verificaValidTouched(campo),
      'has-feedback': this.verificaValidTouched(campo)
    };
  }

  consultaCEP() {

    const cep = this.form.get('endereco.cep').value;

    if (cep != null && cep !== '') {
      this.cepService.consultaCEP(cep)
      .subscribe(dados => this.populaDadosForm(dados));
    }
  }

  populaDadosForm(dados) {

    this.form.patchValue({
      endereco: {
        // cep: dados.cep,
        rua: dados.logradouro,
        bairro: dados.bairro,
        complemento: dados.complemento,
        cidade: dados.localidade,
        estado: dados.uf
      }
    });

    this.form.get('nome').setValue('Yago');
  }

  resetaDadosForm() {

    this.form.patchValue({
      endereco: {
        cep: null,
        numero: null,
        complemento: null,
        rua: null,
        bairro: null,
        cidade: null,
        estado: null
      }
    });
  }

  reset() {
    this.form.reset();
  }

  setarCargo() {
    const cargo = { nome: 'Dev', nivel: 'Junior', desc: 'Dev Jr' };

    this.form.get('cargo').setValue(cargo);
  }

  setarTecnologia() {
    this.form.get('tecnologias').setValue(['java', 'javascript', 'php']);
  }

  buildFrameworks() {
    const values = this.frameworks.map(v => new FormControl(false));

    return this.formBuilder.array(values);
  }

  compararCargos(obj1, obj2) {
    return obj1 && obj2 ? (obj1.nome === obj2.nome && obj1.nivel === obj2.nivel) : obj1 && obj2;
  }
}
