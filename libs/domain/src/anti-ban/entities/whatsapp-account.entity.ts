import { EWhatsAppAccountStatus } from '../enums/whatsapp-account-status.enum';

export class WhatsAppAccount {
  public readonly createdAt: Date;
  public displayName?: string;
  public healthScore: number;
  public readonly id: string;
  public isActive: boolean;
  public lastHealthUpdateAt: Date;
  public messagingLimitTier?: string;
  public readonly phoneNumber: string;
  public qualityRatingTier?: string;
  public status: EWhatsAppAccountStatus;
  public updatedAt: Date;

  private constructor(props: {
    createdAt: Date;
    displayName?: string;
    healthScore: number;
    id: string;
    isActive: boolean;
    lastHealthUpdateAt: Date;
    messagingLimitTier?: string;
    phoneNumber: string;
    qualityRatingTier?: string;
    status: EWhatsAppAccountStatus;
    updatedAt: Date;
  }) {
    this.createdAt = props.createdAt;
    this.displayName = props.displayName;
    this.healthScore = props.healthScore;
    this.id = props.id;
    this.isActive = props.isActive;
    this.lastHealthUpdateAt = props.lastHealthUpdateAt;
    this.messagingLimitTier = props.messagingLimitTier;
    this.phoneNumber = props.phoneNumber;
    this.qualityRatingTier = props.qualityRatingTier;
    this.status = props.status;
    this.updatedAt = props.updatedAt;
  }

  public static create(props: {
    displayName?: string;
    id: string;
    messagingLimitTier?: string;
    phoneNumber: string;
    qualityRatingTier?: string;
  }): WhatsAppAccount {
    const now = new Date();
    return new WhatsAppAccount({
      createdAt: now,
      displayName: props.displayName,
      healthScore: 100,
      id: props.id,
      isActive: true,
      lastHealthUpdateAt: now,
      messagingLimitTier: props.messagingLimitTier,
      phoneNumber: props.phoneNumber,
      qualityRatingTier: props.qualityRatingTier,
      status: EWhatsAppAccountStatus.HEALTHY,
      updatedAt: now,
    });
  }

  public isHealthyForSending(): boolean {
    return (
      this.isActive &&
      this.status !== EWhatsAppAccountStatus.BLOCKED &&
      this.status !== EWhatsAppAccountStatus.RESTRICTED
    );
  }

  public setActive(isActive: boolean): void {
    if (this.isActive !== isActive) {
      this.isActive = isActive;
      this.updatedAt = new Date();
    }
  }

  public setStatus(newStatus: EWhatsAppAccountStatus): void {
    if (this.status !== newStatus) {
      const oldStatus = this.status;
      this.status = newStatus;
      this.updatedAt = new Date();
      if (
        (newStatus === EWhatsAppAccountStatus.BLOCKED ||
          newStatus === EWhatsAppAccountStatus.RESTRICTED) &&
        oldStatus !== EWhatsAppAccountStatus.BLOCKED
      ) {
        this.healthScore = Math.min(this.healthScore, 20);
      }
    }
  }

  public updateHealth(delta: number, newQualityRatingTier?: string): void {
    const previousScore = this.healthScore;
    const previousStatus = this.status;

    this.healthScore = Math.max(0, Math.min(100, this.healthScore + delta));

    let calculatedStatus: EWhatsAppAccountStatus;

    if (this.healthScore <= 30) {
      calculatedStatus = EWhatsAppAccountStatus.RESTRICTED;
    } else if (this.healthScore < 70) {
      calculatedStatus = EWhatsAppAccountStatus.WARN;
    } else {
      calculatedStatus = EWhatsAppAccountStatus.HEALTHY;
    }

    if (newQualityRatingTier === 'RED') {
      calculatedStatus = EWhatsAppAccountStatus.RESTRICTED;
    } else if (
      newQualityRatingTier === 'YELLOW' &&
      calculatedStatus === EWhatsAppAccountStatus.HEALTHY
    ) {
      calculatedStatus = EWhatsAppAccountStatus.WARN;
    } else if (newQualityRatingTier === 'GREEN' && this.healthScore >= 70) {
      calculatedStatus = EWhatsAppAccountStatus.HEALTHY;
    }

    if (this.status !== EWhatsAppAccountStatus.BLOCKED && this.status !== calculatedStatus) {
      this.status = calculatedStatus;
    }

    if (this.healthScore !== previousScore || this.status !== previousStatus) {
      const now = new Date();
      this.lastHealthUpdateAt = now;
      this.updatedAt = now;
    }
  }
}
