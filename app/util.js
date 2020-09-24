function hideAlertBanner() {
    $('.alert').addClass('ng-hide');
}

function disableAllButtons() {
    $("input[type=button]").attr("disabled", true);
    $(':button').attr('disabled', true);
}

function enableAllButtons() {
    $("input[type=button]").attr("disabled", false);
    $(':button').attr('disabled', false);
}

function changeUIbeforeHttpCall() {
    hideAlertBanner();
    disableAllButtons();
    $('#transparentSpinner').show();
}

function changeUIAfterHttpCall() {
    $('#transparentSpinner').hide();
    enableAllButtons();
}