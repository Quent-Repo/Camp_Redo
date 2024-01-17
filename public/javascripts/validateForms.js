
        // Example starter JavaScript for disabling form submissions if there are invalid fields
    (() => {
      'use strict'
      const forms = document.querySelectorAll('.validated-form')
    
      // Loop over them and prevent submission
      //Array.from(forms).forEach(form => {
      Array.from(forms).forEach( function (form){
        form.addEventListener('submit', event => {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
    
          form.classList.add('was-validated')
        }, false)
      })
    })()
