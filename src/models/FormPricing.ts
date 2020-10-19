import { PriceOptionsMarket } from '../@types/MetaData'
import * as Yup from 'yup'

export interface FormPricing {
  price: PriceOptionsMarket
}

export const validationSchema = Yup.object().shape<FormPricing>({
  price: Yup.object()
    .shape({
      price: Yup.number().min(1, 'Must be greater than 0').required('Required'),
      tokensToMint: Yup.number()
        .min(1, 'Must be greater than 0')
        .required('Required'),
      type: Yup.string()
        .matches(/fixed|dynamic/g)
        .required('Required'),
      weightOnDataToken: Yup.string().required('Required'),
      swapFee: Yup.number()
        .min(0.1, 'Must be more or equal to 0.1')
        .max(0.9, 'Must be less or equal to 0.9')
        .required('Required'),
      datatoken: Yup.object()
        .shape({
          name: Yup.string(),
          symbol: Yup.string()
        })
        .nullable()
    })
    .required('Required')
})

export const initialValues: Partial<FormPricing> = {
  price: {
    price: 1,
    type: 'dynamic',
    tokensToMint: 1,
    weightOnDataToken: '9', // 90% on data token
    swapFee: 0.1 // in %
  }
}
