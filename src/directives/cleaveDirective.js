// // cleaveDirective.js
// import Cleave from 'cleave.js'
// import 'cleave.js/dist/addons/cleave-phone.kr'

// export default {
//   mounted: (el, binding) => {
//     el.cleave = new Cleave(el, binding.value || {})
//   },

//   // updated: (el) => {
//   //   const event = new Event('input', { bubbles: true })
//   //   setTimeout(function () {
//   //     el.value = el.cleave.properties.result
//   //     el.dispatchEvent(event)
//   //   }, 100)
//   // },

//   updated: (el, binding) => {
//     if (el.cleave.properties.result !== el.value) {
//       el.cleave.setRawValue(el.value)
//       const event = new Event('input', { bubbles: true })
//       el.dispatchEvent(event)
//     }
//   },

//   unmounted: (el) => {
//     // clns up Cleave instance when directive is unbound
//     if (el.cleave) {
//       el.cleave.destroy()
//     }
//   },
// }

// cleave-directive.js
import Cleave from 'cleave.js'
import 'cleave.js/dist/addons/cleave-phone.kr'

export default {
  mounted: (el, binding) => {
    el.cleave = new Cleave(el, binding.value || {})
    el.addEventListener('input', () => {
      el.dispatchEvent(
        new CustomEvent('cleave:input', {
          detail: {
            formatted: el.value,
            raw: el.cleave.getRawValue(),
          },
        })
      )
    })
  },
  updated: (el, binding) => {
    if (binding.value !== binding.oldValue) {
      el.cleave.destroy()
      el.cleave = new Cleave(el, binding.value || {})
    }
  },
  unmounted: (el) => {
    if (el.cleave) {
      el.cleave.destroy()
    }
  },
}
