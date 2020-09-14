import { hasOwnKey, getOwnKeys } from '../util'
import { Validator, VALIDATOR_KEY } from '../validator'
import { recursiveCallParent } from './util'

declare module '../validator' {
  interface States {
    anyError: boolean
  }
}

const init = (validator: Validator) => {
  recursiveCallParent({
    validator: validator,
    callback: parentWrapper => {
      const parentValidator = parentWrapper[VALIDATOR_KEY]
      const parentForm = validator.getForm(parentValidator.$path)
      parentValidator.$states.anyError =
        parentValidator.$states.error === true ||
        getOwnKeys(parentForm)
          .filter((key: string) => hasOwnKey(parentValidator, key))
          .map((key: string) => parentWrapper[key][VALIDATOR_KEY])
          .some(
            (parentValidator: Validator) =>
              parentValidator.$states.error === true || parentValidator.$states.anyError === true,
          )

      return false
    },
    shouldCallSelf: true,
  })
}

const update = (validator: Validator) => {
  recursiveCallParent({
    validator: validator,
    callback: parentWrapper => {
      const parentValidator = parentWrapper[VALIDATOR_KEY]
      const parentForm = validator.getForm(parentValidator.$path)
      parentValidator.$states.anyError =
        parentValidator.$states.error === true ||
        getOwnKeys(parentForm)
          .map((key: string) => parentWrapper[key][VALIDATOR_KEY])
          .some(
            (parentValidator: Validator) =>
              parentValidator.$states.error === true || parentValidator.$states.anyError === true,
          )

      return false
    },
    shouldCallSelf: true,
  })
}

export default class AnyErrorPlugin {
  apply(validator: Validator) {
    validator.$hooks.onCreated.tap('any-error-plugin', init)

    validator.$hooks.onDoTouched.tap('any-error-plugin', update)

    validator.$hooks.onDoValidatedEach.tap('any-error-plugin', update)

    validator.$hooks.onDoReseted.tap('any-error-plugin', update)
  }
}