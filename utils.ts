import BigNumber from 'bignumber.js'

export function calculateAmountFromLevels(
  amount: string,
  levels: any,
  divide = false
) {
  const totalAmount = new BigNumber(amount)
  let totalCost = new BigNumber(0)
  let previousLevel = new BigNumber(0)
  let incrementalAmount

  if (totalAmount.gt(new BigNumber(levels[levels.length - 1][0]))) {
    throw new Error(
      `Requested amount (${totalAmount.toFixed()}) exceeds maximum available (${new BigNumber(
        levels[levels.length - 1][0]
      ).toFixed()}).`
    )
  }
  for (let i = 0; i < levels.length; i++) {
    if (totalAmount.gt(new BigNumber(levels[i][0]))) {
      incrementalAmount = new BigNumber(levels[i][0]).minus(previousLevel)
    } else {
      incrementalAmount = new BigNumber(totalAmount).minus(previousLevel)
    }
    if (divide) {
      totalCost = totalCost.plus(
        new BigNumber(incrementalAmount).dividedBy(levels[i][1])
      )
    } else {
      totalCost = totalCost.plus(
        new BigNumber(incrementalAmount).multipliedBy(levels[i][1])
      )
    }
    previousLevel = levels[i][0]
    if (incrementalAmount.lt(previousLevel)) break
  }
  return totalCost.decimalPlaces(6).toFixed()
}

export const decimals: any = {
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 6,
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 18,
}