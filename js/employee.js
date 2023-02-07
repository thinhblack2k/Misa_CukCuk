$(document).ready(function() {
    loadData();
    initEvent();
})

var MISAEnum = {
    EditMode: {
        Add: 1,
        Edit: 2,
        Delete: 3
    }
}
var employeeSelected = null;
var editMode = MISAEnum.EditMode.Add;

/**
 * Thực hiện load dữ liệu ban đầu
 * Author : DHTHINH (07/07/2022)
 */
function loadData() {
    try {
        $("#tbEmployeeList tbody").empty();
        $(".loading").show();
        //Gọi API thực lấy dữ liệu
        $.ajax({
            type: "GET",
            url: "https://cukcuk.manhnv.net/api/v1/Employees",
            success: function (response) {
                let employees = response;
                
                //Thực hiện hiển thị dữ liệu lên table 
                let count = 1;
                for (const emp of employees) {
                    const employeesCode = emp.EmployeeCode;
                    const fullName = emp.FullName;
                    const gerder = emp.GenderName;
                    let dob = emp["DateOfBirth"];
                    const phone = emp["PhoneNumber"];
                    const email = emp.Email;
                    const positionName = emp.PositionName;
                    const departmentName = emp.DepartmentName;
                    const salary = emp.Salary;
                    let workStatus = emp.WorkStatus;
                    
                    //Xử lý dữ liệu
                    //Định dạng ngày tháng năm:
                    dob = formatDate(dob);

                    //Định dang tiền tệ:

                    //Xử lý trạng thái công việc:
                    if (workStatus == 1) {
                        workStatus = "Đang làm"
                    }
                    else if (workStatus == 2) {
                        workStatus = "Tạm nghỉ"
                    }

                    let tr = $(`<tr>
                                <td class="table__center">${count}</td>
                                <td class="table__left">${employeesCode || ""}</td>
                                <td class="table__left">${fullName || ""}</td>
                                <td class="table__left">${gerder || ""}</td>
                                <td class="table__center">${dob || ""}</td>
                                <td class="table__center">${phone || ""}</td>
                                <td class="table__left">${email || ""}</td>
                                <td class="table__left">${positionName || ""}</td>
                                <td class="table__left">${departmentName || ""}</td>
                                <td class="table__right">${salary || ""}</td>
                                <td class="table__center" style="width: 120px; padding-left: 20px;">${workStatus || ""}</td>
                            </tr>`);
                            tr.data("key", emp.EmployeeId);
                            tr.data("employees", emp);
                    count ++;
                    $("#tbEmployeeList tbody").append(tr);
                }
                $(".loading").hide();
            },
            error: function() {
                
            }
        });
    } catch (error) {
        console.log(error);
    }
    
}

/**
 * Định Dạng ngày/tháng/năm
 * @param {eny} date 
 * @returns 
 */
function formatDate(date) {
    try {
        if (date) {
            date = new Date(date);
            let newDate = date.getDate();
            let month = date.getMonth()+1;
            let year = date.getFullYear();

            return `${newDate}/${month}/${year}`;
        }
    } catch (error) {
        console.log(error);
        return "";
    }
}


/**
 * Tạo các sự kiện cho các thành phần
 * Author: DHTHINH (05/07/2022)
 */

 function initEvent() {
    //Nhấn vào thêm mới thì hiển thị form thêm mới:
    $("#btnAdd").click(function(e) {
        editMode = MISAEnum.EditMode.Add;
        //Hiển thị form:
        $("#dlgEmployeeDetail").show();
        //Thực hiện lấy mã nhân viên mới từ api
        $.ajax({
            type: "GET",
            url: "https://cukcuk.manhnv.net/api/v1/Employees/NewEmployeeCode",
            success: function (response) {
                //Binding mã nhân viên vào text box mã nhân viên
                $("#txtEmployeeCode").val(response);
                //focus vào ô nhập liệu đầu tiên:
                $("#txtEmployeeCode").focus();
            },
            error: function(res) {
                console.log(res);
            }
        });
    });

    $("#btnSave").click(btnSaveOnClick);

    $("#btnRefresh").click(function(e){
        loadData();
    })

    $("#tbEmployeeList tbody").on('click', 'tr', function() {
        $(this).siblings('.row--selected').removeClass("row--selected");
        $(this).addClass("row--selected");
        const employeeId = $(this).data("key");
        employeeSelected = employeeId;
        $("#btnDelete").show();
    })

    //kích đúp chuột thì mở form chi tiết nhân viên
    $("#tbEmployeeList tbody").on('dblclick', 'tr', function() {
        editMode = MISAEnum.EditMode.Edit;
        const employeeId = $(this).data("key");
        employeeSelected = employeeId;
        // Gọi api lấy chi tiết thông tin nhân viên:
        $.ajax({
            type: "GET",
            url: `https://cukcuk.manhnv.net/api/v1/Employees/${employeeId}`,
            success: function(employee) {
                // Lấy các thông tin và binding vào form:
                $("#txtEmployeeCode").val(employee.EmployeeCode);
                $("#txtFullName").val(employee.FullName);
                $("#txtEmail").val(employee.Email);
            }
        });
        $("#dlgEmployeeDetail").show();
    })

    //ấn vào button close thì đóng form lại
    $(".dialog .dialog__close").click(function(e) {
        var currentDialog = $(this).parents('.dialog');
        $(currentDialog).hide();
        $(".input__error").focus();
    })

    $("#btnDelete").click(function(e) {
        editMode = MISAEnum.EditMode.Edit;
        $(".dialog__warning .dialog__body").empty();
        $(".dialog__warning").show();
        $.ajax({
            type: "DELETE",
            url: `https://cukcuk.manhnv.net/api/v1/Employees/${employeeSelected}`,
            success: function(res) {
                // Hiển thị toast messenger thông báo thêm mới thành công:
                alert("Xóa thành công!")
                loadData();
                $("#dlgEmployeeDetail").hide();
            },
            error: function(res) {
                debugger
                // Hiển thị cánh báo lỗi:
            }
        });
        
    })

    //Nếu các trường bắt buộc bị bỏ trống border input sẽ chuyển sang màu đỏ:
    $(".required").blur(function(){
        let value = $(this).val();
        if(!value) {
            $(this).addClass("input__error");
        }
        else {
            $(this).removeClass("input__error");
        }
    })
 }

 /**
 * Tạo các sự kiện cho các thành phần
 * Author: DHTHINH (05/07/2022)
 */
function btnSaveOnClick() {
    try {
        
        debugger

        // validate dữ liệu
        let isValid = validateData();
        if (isValid) {
            // Thực hiện lưu dữ liệu:

            // Build đối tượng với các thông tin thu thập từ input:
            let employees = {
                "EmployeeCode": $("#txtEmployeeCode").val(),
                "FullName": $("#txtFullName").val(),
                "DateOfBirth": $("#dtDateOfBirth").val(),
                "Email": $("#txtEmail").val(),
                "PhoneNumber": $("#txtPhoneNumber").val()
            }

            // Gọi API lưu dữ liệu
            if (editMode == MISAEnum.EditMode.Add) {
                $.ajax({
                    type: "POST",
                    url: "https://cukcuk.manhnv.net/api/v1/Employees",
                    data: JSON.stringify(employees),
                    dataType: "json",
                    contentType: "application/json",
                    success: function(res) {
                        // Hiển thị toast messenger thông báo thêm mới thành công:
                        alert("Thêm mới thành công!")
                        loadData();
                        $("#dlgEmployeeDetail").hide();
                    },
                    error: function(res) {
                        debugger
                        // Hiển thị cánh báo lỗi:
                    }
                });
            } else {
                $.ajax({
                    type: "PUT",
                    url: `https://cukcuk.manhnv.net/api/v1/Employees/${employeeSelected}`,
                    data: JSON.stringify(employees),
                    dataType: "json",
                    contentType: "application/json",
                    success: function(res) {
                        // Hiển thị toast messenger thông báo thêm mới thành công:
                        alert("Sửa mới thành công!")
                        loadData();
                        $("#dlgEmployeeDetail").hide();
                    },
                    error: function(res) {
                        debugger
                        // Hiển thị cánh báo lỗi:
                    }
                });
            }

            
        }
        else {
            
        }
    } catch (error) {
        console.log(error);
    }
}

/**
 * Thực hiện validate data
 * Author DHTHINH (05/07/2022)
 */
function validateData() {
    $(".dialog__warning .dialog__body").empty();
    let isValid = true;
    let errorMsgs = [];
    // Các thông tin bắt buộc nhập:
    // 1. Mã nhân viên, họ và tên, Email, SĐT không được phép trống:
    // 2. Họ và tên
    let employeeCode = $("#txtEmployeeCode").val();
    let fullName = $("#txtFullName").val();
    let email = $("#txtEmail").val();
    if (!employeeCode) {
        isValid = false;
        // Hiển thị style cảnh báo lỗi:
        $("#txtEmployeeCode").addClass("input__error");
        errorMsgs.push("Mã nhân viên không được phép để trống");
    } else {
        $("#txtEmployeeCode").removeClass("input__error");
    }

    if (!fullName) {
        isValid = false;
        // Hiển thị style cảnh báo lỗi:
        $("#txtFullName").addClass("input__error");
        errorMsgs.push("Họ và tên không được phép để trống");
    } else {
        $("#txtFullName").removeClass("input__error");
    }

    if (!email) {
        isValid = false;
        // Hiển thị style cảnh báo lỗi:
        $("#txtEmail").addClass("input__error");
        errorMsgs.push("Email không được phép để trống");
    } else {
        $("#txtEmail").removeClass("input__error");
    }

    // 3. Email đúng định dạng:
    if (email) {
        var emailFormat = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
        if (!emailFormat.test(email)) {
            isValid = false;
            $("#txtEmail").addClass("input__error");
            errorMsgs.push("Email không đúng định dạng.");
        } else {
            $("#txtEmail").removeClass("input__error");
        }
    }

    // 4. NGày tháng phải nhỏ hơn ngày hiện tại:
    let dateOfbirth = $("#dtDateOfBirth").val();
    dateOfbirth = new Date(dateOfbirth);
    if (dateOfbirth > new Date()) {
        isValid = false;
        // alert("Ngày sinh không được lớn hơn ngày hiện tại");
        errorMsgs.push("Ngày sinh không được lớn hơn ngày hiện tại.");

    }
    if (errorMsgs.length > 0) {
        $(".dialog__warning .dialog__body")
        for (const msg of errorMsgs) {
            $(".dialog__warning .dialog__body").append(` <div class="dialog__msg-item">${msg}</div>`);
        }
        $(".dialog__warning").show();
    }
    return isValid;
}