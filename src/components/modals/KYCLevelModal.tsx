import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { KYCLevel, KYCStatus, TimeUnit } from '../../contexts/KYCAdminContext'

interface KYCLevelModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (level: Partial<KYCLevel>) => void
  level?: KYCLevel | null
}

export function KYCLevelModal({ isOpen, onClose, onSave, level }: KYCLevelModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    status: KYCStatus.NotSubmitted,
    maxDepositAmount: '',
    maxWithdrawalAmount: '',
    duration: '',
    timeUnit: TimeUnit.days
  })

  useEffect(() => {
    if (level) {
      setFormData({
        code: level.code,
        description: level.description,
        status: level.status,
        maxDepositAmount: level.maxDepositAmount?.toString() || '',
        maxWithdrawalAmount: level.maxWithdrawalAmount?.toString() || '',
        duration: level.duration.toString(),
        timeUnit: level.timeUnit
      })
    } else {
      setFormData({
        code: '',
        description: '',
        status: KYCStatus.NotSubmitted,
        maxDepositAmount: '',
        maxWithdrawalAmount: '',
        duration: '',
        timeUnit: TimeUnit.days
      })
    }
  }, [level, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      code: formData.code,
      description: formData.description,
      status: formData.status,
      maxDepositAmount: formData.maxDepositAmount ? parseFloat(formData.maxDepositAmount) : undefined,
      maxWithdrawalAmount: formData.maxWithdrawalAmount ? parseFloat(formData.maxWithdrawalAmount) : undefined,
      duration: parseInt(formData.duration),
      timeUnit: formData.timeUnit
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{level ? 'Edit KYC Level' : 'Create KYC Level'}</DialogTitle>
          <DialogDescription>
            {level ? 'Update the KYC level details.' : 'Create a new KYC level configuration.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., BASIC, INTERMEDIATE"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this KYC level..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as KYCStatus })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(KYCStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxDeposit">Max Deposit Amount</Label>
              <Input
                id="maxDeposit"
                type="number"
                value={formData.maxDepositAmount}
                onChange={(e) => setFormData({ ...formData, maxDepositAmount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxWithdrawal">Max Withdrawal Amount</Label>
              <Input
                id="maxWithdrawal"
                type="number"
                value={formData.maxWithdrawalAmount}
                onChange={(e) => setFormData({ ...formData, maxWithdrawalAmount: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeUnit">Time Unit</Label>
              <Select value={formData.timeUnit} onValueChange={(value) => setFormData({ ...formData, timeUnit: value as TimeUnit })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TimeUnit).map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {level ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}