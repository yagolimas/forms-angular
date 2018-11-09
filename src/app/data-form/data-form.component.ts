import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
//import { HttpClient } from '@angular/common/http';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.css']
})
export class DataFormComponent implements OnInit {

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: Http
  ) { }

  ngOnInit() {

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
      })
    });
  }

  onSubmit() {

    console.log(this.form.value)
    
    if (this.form.valid) {

      this.http.post('https://httpbin.org/post', JSON.stringify(this.form.value))
        .subscribe(dados => { 
          console.log(dados)
          //this.reset();
        },
        (error: any) => alert('error')
      );
    } else {
      this.verificaValidacoesForm(this.form);
    }
  }

  verificaValidacoesForm(formGroup: FormGroup) {
    let campos = formGroup.controls;

    Object.keys(campos).forEach(campo => {
      let control = formGroup.get(campo);
      control.markAsDirty();
      if (control instanceof FormGroup) {
        this.verificaValidacoesForm(control);
      }     
    });
  }

  verificaValidTouched(campo: string) {

    return !this.form.get(campo).valid && (this.form.get(campo).touched || this.form.get(campo).dirty); 

    //return !campo.valid && campo.touched;
  }

  verificaEmailInvalido() {
    
    let campoEmail = this.form.get('email');
    
    if (campoEmail.errors) {
      return campoEmail.errors['email'] && campoEmail.touched;
    }
  }

  aplicaCss(campo) {

    return {
      'has-error': this.verificaValidTouched(campo),
      'has-feedback': this.verificaValidTouched(campo)
    }
  }

  consultaCEP() {

    let cep = this.form.get('endereco.cep').value;

    // Nova variável "cep" somente com dígitos.
    cep = cep.replace(/\D/g, '');

    // Verifica se campo cep possui valor informado.
    if (cep !== '') {
      // Expressão regular para validar o CEP.
      const validacep = /^[0-9]{8}$/;
      
      // Valida o formato do CEP.
      if (validacep.test(cep)) {
        
        //this.resetaDadosForm();
        
        this.http.get(`//viacep.com.br/ws/${cep}/json`)
          .map(dados => dados.json())
          .subscribe(dados => this.populaDadosForm(dados))
      }
    }
  }

  populaDadosForm(dados) {

    this.form.patchValue({
      endereco: {
        //cep: dados.cep,        
        rua: dados.logradouro,
        bairro: dados.bairro,
        complemento: dados.complemento,
        cidade: dados.localidade,
        estado: dados.uf
      }
    });

    this.form.get('nome').setValue('Yago') 
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
}
