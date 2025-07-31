export interface IAddMoneyPayload {
  agentPhone: string;
  amount: number;
  description?: string;
}

export interface IWithdrawMoneyPayload {
  agentPhone: string;
  amount: number;
  description?: string;
}

export interface ISendMoneyPayload {
  receiverPhone: string;
  amount: number;
  description?: string;
}


export interface ICashInPayload {
  userPhone: string;
  amount: number;
  description?: string;
}


export interface ICashOutPayload {
  userPhone: string;
  amount: number;
  description?: string;
}