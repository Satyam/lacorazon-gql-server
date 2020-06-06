// / <refe rence types="sqlite" />

type ID = string | number;

type Rango = { offset?: number, limit?: number, last?: number }

type unused = any

type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>