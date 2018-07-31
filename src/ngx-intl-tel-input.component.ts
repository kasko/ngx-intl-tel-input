import { Component, Output, Input, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { CountryCode } from './resource/country-code';
import { Country } from './model/country.model';
import * as _ from 'google-libphonenumber';

@Component({
  selector: 'ngx-intl-tel-input',
  templateUrl: './ngx-intl-tel-input.component.html',
  styleUrls: ['./ngx-intl-tel-input.component.css'],
  providers: [CountryCode]
})
export class NgxIntlTelInputComponent implements OnInit {
  @Input() value = '';
  @Input() preferredCountries: Array<string> = [];
  @Input() availableCountries: Array<string> = [];
  @Input() placeholder: string;
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('countrycode') countrycode;

  phone_number = '';
  allCountries: Array<Country> = [];
  preferredCountriesInDropDown: Array<Country> = [];
  selectedCountry: Country = new Country();
  constructor(
      private countryCodeData: CountryCode
  ) {
    this.fetchCountryData();
  }

  ngOnInit() {
    if (this.preferredCountries.length) {
      this.preferredCountries.forEach(iso2 => {
        const preferredCountry = this.allCountries.filter((c) => c.iso2 === iso2);
        this.preferredCountriesInDropDown.push(preferredCountry[0]);
      });
    }

    if (this.availableCountries.length) {
      const countries = [];

      this.availableCountries.forEach((iso2) => {
        countries.push(this.allCountries.find((c) => c.iso2 === iso2));
      });

      this.allCountries = countries;
    }

    const value = (this.value || '');

    const selectedCountry = this.allCountries.find((country) => {
      const regex = new RegExp(`^\\+?${country.dialCode}`);
      return regex.test(value);
    });

    if (selectedCountry) {
      this.selectedCountry = selectedCountry;
    } else if (this.preferredCountriesInDropDown.length) {
      this.selectedCountry = this.preferredCountriesInDropDown[0];
    } else {
      this.selectedCountry = this.allCountries[0];
    }

    this.phone_number = value;
  }

  public onPhoneNumberChange(): void {
    this.setValue(this.phone_number);
  }

  public onCountrySelect(country: Country, el): void {
    this.selectedCountry = country;
    if (this.phone_number.length > 0) {
      this.setValue(this.phone_number);
    }
    el.focus();
  }

  public onInputKeyPress(event): void {
    // keyCode 8  -> backspace
    // keyCode 46 -> delete
    // keyCode 37 -> left arrow
    // keyCode 39 -> right arrow
    if ([8, 46, 37, 39].indexOf(event.keyCode) >= 0) {
      return;
    }

    const pattern = /[0-9+]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public getCountryCodeWidth(): number {
    return this.countrycode.nativeElement.getBoundingClientRect().width;
  }

  protected setValue(value, emit: boolean = true) {
    const country = this.selectedCountry;
    const regex = new RegExp(`^${country.dialCode}`);

    if (['ch'].indexOf(country.iso2) >= 0) {
      value = value.replace(/^0/, '');
    }

    this.value = '+' + country.dialCode + value.replace(/^\+/, '').replace(regex, '');

    if (emit) {
      this.valueChange.emit(this.value);
    }
  }

  protected fetchCountryData(): void {
    this.countryCodeData.allCountries.forEach(c => {
      let country = new Country();
      country.name = c[0].toString();
      country.iso2 = c[1].toString();
      country.dialCode = c[2].toString();
      country.priority = +c[3] || 0;
      country.areaCode = +c[4] || null;
      country.flagClass = country.iso2.toLocaleLowerCase();
      country.placeHolder = this.getPhoneNumberPlaceHolder(country.iso2.toUpperCase());
      this.allCountries.push(country);
    });
  }

  protected getPhoneNumberPlaceHolder(countryCode: string): string {
    const phoneUtil = _.PhoneNumberUtil.getInstance();
    const pnf = _.PhoneNumberFormat;
    try {
      let phoneNumber = phoneUtil.parse('2236512366', countryCode);
      return phoneUtil
        .format(phoneNumber, pnf.INTERNATIONAL)
        .replace(/^\+[^ ]+/, '').trim();
    } catch (e) {
      console.log('CountryCode: "' + countryCode + '" ' + e);
      return e;
    }
  }
}
