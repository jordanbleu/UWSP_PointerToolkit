(function () {
    'use strict';

    function gpaController($scope, $ionicHistory, $timeout, $state) {
        $("#frmCumulativeGPA").slideUp(0);

        bindDropdownEvent();


        $("#btnAddRow").click(function () {
            var activeForm = $("#cboFormSelect").val();

            if (activeForm == "semestergpa") {
                $(".gpaRow").first().clone().appendTo("#frmSemesterGPA").slideUp(0).slideDown("fast")
                        .find(".btnDeleteRow").prop("disabled", false).click(function () {
                            $(this).parent().parent().slideUp("fast").remove();
                        });
                bindDropdownEvent();

            } else {
                var el = $(".cumulativeRow").first().clone().appendTo("#frmCumulativeGPA").slideUp(0).slideDown("fast")
                        .find(".btnDeleteRow").prop("disabled", false).click(function () {
                    $(this).parent().parent().slideUp("fast").remove();
                    // remove the buttons except for the last row
                    $(".btnDeleteRow").hide();
                    $(".cumulativeRow").last().find(".btnDeleteRow").show();
                    $(".cumulativeRow").find(".cumSemName").each(function (index) {
                        $(this).html("Semester " + (index+1) + " GPA:");
                    });
                });

                var count = $(".cumulativeRow").length;
                console.log(count);
                $(".cumulativeRow").last().find(".cumSemName").first().html("Semester " + count + " GPA:");

                // remove the buttons except for the last row
                $(".btnDeleteRow").hide();
                $(".cumulativeRow").last().find(".btnDeleteRow").show();
              
            }

            
        });

        $("#btnCalculateGPA").click(function () {
            var activeForm = $("#cboFormSelect").val();

            if (activeForm == "semestergpa") {
                var gradeSum = 0.0;
                $(".cboGradeValue").not(".gpaignore").each(function () {
                    var credits = $(this).parent().parent().parent().find(".txtCreditValue").first().val();
                    gradeSum += parseFloat(parseFloat($(this).val()) * credits);
                });


                var creditSum = 0.0;
                $(".txtCreditValue").not(".gpaignore").each(function () {
                    creditSum += parseFloat($(this).val());
                });
                
                if (Form_Is_Valid()) {
                    $("#txtResult").val(parseFloat(gradeSum / creditSum).toFixed(2));
                }
            } else {

                var gpaSum = 0.0;
                var semCount = $(".txtSemGPA").length;
                $(".txtSemGPA").each(function () {
                    gpaSum += parseFloat($(this).val());

                    if (Form_Is_Valid()) {
                        $("#txtResult").val(parseFloat(gpaSum / semCount).toFixed(2));
                    }
                });
            }

            if (isNaN($("#txtResult").val())){
                $("#txtResult").val(" - - ");
            };
        });

        $("#cboFormSelect").change(function () {
            $("#txtResult").val("");

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

    function bindDropdownEvent() {
        // if the value is PASS, add a flag to ignore it
        // The way UWPS calculates GPA, if a class is passed it doesn't affect your overall semester GPA
        // However if you fail, you get an F
        $(".cboGradeValue").change(function () {
            if ($(this).val() == "PASS") {
                $(this).parent().parent().parent().find(".colCredit").find(".txtCreditValue").addClass("gpaignore");
                $(this).addClass("gpaignore");
            } else {
                $(this).parent().parent().parent().find(".colCredit").find(".txtCreditValue").removeClass("gpaignore");
                $(this).removeClass("gpaignore");
            }
        });

    }


    function error(txt) {
        $("#error").html(txt);
    }

    function Form_Is_Valid() {
        var activeForm = $("#cboFormSelect").val();
        var valid = true;

        if (activeForm == "semestergpa") {
            $(".txtCreditValue").each(function () {
                if ($(this).val() == null || $(this).val() == "") {
                    error("Please fill out all fields to calculate GPA");
                    $(this).css("background-color", "#E57373");
                    valid = false;
                } else if ($(this).val() > 20) {
                    error("Credit value cannot be greater than 20");
                    $(this).css("background-color", "#E57373");
                    valid = false;
                }
            });
        } else {
            $(".txtSemGPA").each(function () {
                if ($(this).val() == null || $(this).val() == "") {
                    error("Please fill out all fields to calculate GPA");
                    $(this).css("background-color", "#E57373");
                    valid = false;
                } else if ($(this).val() > 4 || $(this).val() < 0) {
                    error("GPA Cannot be greater than 4.0 or less than 0.0");
                    $(this).css("background-color", "#E57373");
                    valid = false;
                }
            });
        }

        if (valid) {
            error("");
            $(".txtSemGPA").css("background-color", "white");
            $(".txtCreditValue").css("background-color", "white");
        }
        
        return valid;

    }


    angular
      .module('gpa', [])
      .controller('gpaController', gpaController);
})();









