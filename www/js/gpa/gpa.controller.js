
(function () {
    'use strict';

    function gpaController($scope, $ionicHistory, $timeout, $state) {
        


    }

    angular
      .module('gpa', [])
      .controller('gpaController', gpaController);


})();

function CalculateGPA() {
    //get the value of the grades
    gr1 = document.calcForm.grade1.value;
    gr2 = document.calcForm.grade2.value;
    gr3 = document.calcForm.grade3.value;
    gr4 = document.calcForm.grade4.value;
    gr5 = document.calcForm.grade5.value;
    gr6 = document.calcForm.grade6.value;
    gr7 = document.calcForm.grade7.value;
    gr8 = document.calcForm.grade8.value;

    //get the value of the credits
    cr1 = document.calcForm.credit1.value;
    cr2 = document.calcForm.credit2.value;
    cr3 = document.calcForm.credit3.value;
    cr4 = document.calcForm.credit4.value;
    cr5 = document.calcForm.credit5.value;
    cr6 = document.calcForm.credit6.value;
    cr7 = document.calcForm.credit7.value;
    cr8 = document.calcForm.credit8.value;

    //Sum of total semester credits
    creditSum = +cr1 + +cr2 + +cr3 + +cr4 + +cr5 + +cr6 + +cr7 + +cr8;

    class1 = gr1 * cr1;
    class2 = gr2 * cr2;
    class3 = gr3 * cr3;
    class4 = gr4 * cr4;
    class5 = gr5 * cr5;
    class6 = gr6 * cr6;
    class7 = gr7 * cr7;
    class8 = gr8 * cr8;
    
    classSum = class1 + +class2 + +class3 + +class4 + +class5 + +class6 + +class7 + +class8;
    
    gpa = parseFloat(classSum / creditSum);
    alert("Your GPA is: " + gpa.toFixed(2));
}

