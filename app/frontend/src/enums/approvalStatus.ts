export enum EApprovalStatus {
  PENDING = 'PENDING',           // На согласовании
  APPROVED = 'APPROVED',         // Согласовано
}

export const approvalStatusDict = {
  [EApprovalStatus.PENDING]: 'На согласовании',
  [EApprovalStatus.APPROVED]: 'Согласовано',
};

