(function () {
    'use strict';

    function gpaController($scope, $ionicHistory, $timeout, $state) {
        $("#frmCumulativeGPA").slideUp(0);

        $("#btnAddRow").click(function () {
            var activeForm = $("cboFormSelect").val();

            if (activeForm == "semestergpa") {
                $(".gpaRow").first().clone().appendTo("#frmSemesterGPA").find(".btnDeleteRow").prop("disabled", false).click(function () {
                    $(this).parent().parent().remove();
                });
            } else {
                var el = $(".cumulativeRow").first().clone().appendTo("#frmCumulativeGPA").find(".btnDeleteRow").prop("disabled", false).click(function () {
                    $(this).parent().parent().remove();
                    // remove the buttons except for the last row
                    $(".btnDeleteRow").hide();
                    $(".cumulativeRow").last().find(".btnDeleteRow").show();
                    $(".cumulativeRow").last().find(".cumSemName").first().html("Semester " + count + " GPA:");
                });

                var count = $(".cumulativeRow").length;
                console.log(count);

                // remove the buttons except for the last row
                $(".btnDeleteRow").hide();
                $(".cumulativeRow").last().find(".btnDeleteRow").show();
                $(".cumulativeRow").last().find(".cumSemName").first().html("Semester " + count + " GPA:");
                
            }

            
        });

        $("#btnCalculateGPA").click(function () {
            var activeForm = $("cboFormSelect").val();

            if (activeForm == "semestergpa") {
                var gradeSum = 0.0;
                $(".cboGradeValue").each(function () {
                    // get the credit value next to the grade textbox
                    var credits = $(this).parent().parent().parent().find(".txtCreditValue").first().val();
                    gradeSum += parseFloat(parseFloat($(this).val()) * credits);
                });


                var creditSum = 0.0;
                $(".txtCreditValue").each(function () {
                    creditSum += parseFloat($(this).val());
                });

                $("#txtResult").val(parseFloat(gradeSum / creditSum).toFixed(2));
            } else {
                var gpaSum = 0.0;
                var semCount = $(".txtSemGPA").length;
                $(".txtSemGPA").each(function () {
                    gpaSum += parseFloat($(this).val());
                    $("#txtResult").val(parseFloat(gpaSum / semCount).toFixed(2));
                })


            }
        });

        $("#cboFormSelect").change(function () {
            switch ($(this).val()) {
                case "semestergpa":
                    $("#frmCumulativeGPA").slideUp(function () {
                        $("#frmSemesterGPA").slideDown();
                    });
                    break;

                case "cumulativegpa":
                    $("#frmSemesterGPA").slideUp(function () {
                        $("#frmCumulativeGPA").slideDown();
                    });
                    break;
            }
        });
        

    
    }


    angular
      .module('gpa', [])
      .controller('gpaController', gpaController);
})();










//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//(function () {
//    'use strict';

//    function gpaController($scope, $ionicHistory, $timeout, $state) {
        
//        var gradeSum = 0;
//        var creditSum = 0;
//        $("#credit").click(function () {
//            //classSum += (this).val();
//            //alert("credits selected");
//        });

//        //$("#grade").each(function () {
//        //    gradeSum += (this).val();
//        //    alert("grade selected");
//        //    gradeSum;
//        //    gradeSum += parseFloat(this.value);
//        //});

//        $("#calculateGPA").click(function () {
//            $("#grade").each(function () {
//                gradeSum += parseFloat(this.value);
//            });
//            //$("#credit").each(function () {
//            //    creditSum += parseFloat(this.value);
//            //});
//            alert("grade sum is: " + creditSum)
//        });

//        $("#add").click(function () {
//            //for (var i = 0; i < 1; i++) {
//                $("#append").append("<div id='append' class='remove'><label class='item item-input item-select' style='width:50%; float:left; margin-bottom: 5px;'>" +
//                            "<div class='input-label'>Grade</div>" +
//                            "<select id='grade'>" +
//                                "<option selected></option>" +
//                                "<option value='4'>A</option>" +
//                                "<option value='3.67'>A-</option>" +
//                                "<option value='3.33'>B+</option>" +
//                                "<option value='3'>B</option>" +
//                                "<option value='2.67'>B-</option>" +
//                                "<option value='2.33'>C+</option>" +
//                                "<option value='2'>C</option>" +
//                                "<option value='1.67'>C-</option>" +
//                                "<option value='1.33'>D+</option>" +
//                                "<option value='1'>D</option>" +
//                                "<option value='0'>F</option>" +
//                            "</select>" +
//                        "</label>" +

//                        "<label class='item item-input item-select' style='width:50%; float:right; margin-bottom: 5px;'>" +
//                            "<div class='input-label'>Credits</div>" +
//                            "<select id='credit'>" +
//                                "<option selected></option>" +
//                                "<option value='1'>1</option>" +
//                                "<option value='2'>2</option>" +
//                                "<option value='3'>3</option>" +
//                                "<option value='4'>4</option>" +
//                                "<option value='5'>5</option>" +
//                            "</select>" +
//                        "</label></div>");
//            //}
//        });

//        $("#remove").click(function () {      
//            $(".remove").nextAll().remove();
//        });
//    }

//    angular
//      .module('gpa', [])
//      .controller('gpaController', gpaController);
//})();

//var gpa;
//var cgpa;
//var creditSum;
//var classSum;
////var gradeSum;






////function CalculateGPA() {
////    //get the value of the grades
////    gr1 = document.calcForm.grade1.value;
////    gr2 = document.calcForm.grade2.value;
////    gr3 = document.calcForm.grade3.value;
////    gr4 = document.calcForm.grade4.value;
////    gr5 = document.calcForm.grade5.value;
////    gr6 = document.calcForm.grade6.value;
////    gr7 = document.calcForm.grade7.value;
////    gr8 = document.calcForm.grade8.value;

////    //total sum of grade points
////    gradeSum = +gr1 + +gr2 + +gr3 + +gr4 + +gr5 + +gr6 + +gr7 + +gr8;

////    //get the value of the credits
////    cr1 = document.calcForm.credit1.value;
////    cr2 = document.calcForm.credit2.value;
////    cr3 = document.calcForm.credit3.value;
////    cr4 = document.calcForm.credit4.value;
////    cr5 = document.calcForm.credit5.value;
////    cr6 = document.calcForm.credit6.value;
////    cr7 = document.calcForm.credit7.value;
////    cr8 = document.calcForm.credit8.value;

////    //Sum of total semester credits
////    creditSum = +cr1 + +cr2 + +cr3 + +cr4 + +cr5 + +cr6 + +cr7 + +cr8;

////    class1 = gr1 * cr1;
////    class2 = gr2 * cr2;
////    class3 = gr3 * cr3;
////    class4 = gr4 * cr4;
////    class5 = gr5 * cr5;
////    class6 = gr6 * cr6;
////    class7 = gr7 * cr7;
////    class8 = gr8 * cr8;
    
////    classSum = +class1 + +class2 + +class3 + +class4 + +class5 + +class6 + +class7 + +class8;
    
////    gpa = parseFloat(classSum / creditSum);

////    if (gr1 != "" && cr1 == "") {
////        alert("Please enter credits for your first class.");
////    } else if (gr1 == "" && cr1 != "") {
////        alert("Please enter a grade for your first class.");
////    } else if (gr2 != "" && cr2 == "") {
////        alert("Please enter credits for your second class.");
////    } else if (gr2 == "" && cr2 != "") {
////        alert("Please enter a grade for your second class.");
////    } else if (gr3 != "" && cr3 == "") {
////        alert("Please enter credits for your third class.");
////    } else if (gr3 == "" && cr3 != "") {
////        alert("Please enter a grade for your third class.");
////    } else if (gr4 != "" && cr4 == "") {
////        alert("Please enter credits for your fourth class.");
////    } else if (gr4 == "" && cr4 != "") {
////        alert("Please enter a grade for your fourth class.");
////    } else if (gr5 != "" && cr5 == "") {
////        alert("Please enter credits for your fifth class.");
////    } else if (gr5 == "" && cr5 != "") {
////        alert("Please enter a grade for your fifth class.");
////    } else if (gr6 != "" && cr6 == "") {
////        alert("Please enter credits for your sixth class.");
////    } else if (gr6 == "" && cr6 != "") {
////        alert("Please enter a grade for your sixth class.");
////    } else if (gr7 != "" && cr7 == "") {
////        alert("Please enter credits for your seventh class.");
////    } else if (gr7 == "" && cr7 != "") {
////        alert("Please enter a grade for your seventh class.");
////    } else if (gr8 != "" && cr8 == "") {
////        alert("Please enter credits for your eihth class.");
////    } else if (gr8 == "" && cr8 != "") {
////        alert("Please enter a grade for your eihth class.");
////    } else {
////        alert("Your GPA is: " + gpa.toFixed(2));
////    }

////}

//////calculate cumulative gpa
////function calculateCGPA() {
////    pcg = document.getElementById('pcg').value;
////    pcc = document.getElementById('pcc').value;
////    gpa = gpa.toFixed(2);

////    totalPoints = pcg * pcc;
////    alert(totalPoints);

////    totalGrade = totalGrade.toFixed(2);

////    totalCredit = +creditSum + +pcc;

////    cgpa = gpa(totalPoints/totalCredit);
////    alert('Your cumulative GPA is: ' + cgpa.toFixed(2));
////}

//////here is how to switch between the two calculators
//function showGPA(elem) {
//    //display semester gpa calculator
//    if (elem.value == 0) {
//        document.getElementById('CGPAForm').style.display = "none";
//        document.getElementById('GPAForm').style.display = "block";
//    }

//    //display cumulative gpa calculator
//    if (elem.value == 1) {
//        document.getElementById('GPAForm').style.display = "none";
//        document.getElementById('CGPAForm').style.display = "block";
//    }
//}