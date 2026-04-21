import {
  CommandExecution,
  CommandExecutionStatus,
} from '../../../../src/modules/rural-producer/domain/entities/command-execution';

const makeExecution = (status?: CommandExecutionStatus) =>
  new CommandExecution(
    'exec-id-1',
    'CreateRuralProducerCommand',
    'corr-123',
    status,
  );

describe('CommandExecution', () => {
  describe('construction', () => {
    it('should default to PENDING status', () => {
      const exec = makeExecution();
      expect(exec.status).toBe(CommandExecutionStatus.PENDING);
    });

    it('should assign all provided fields', () => {
      const createdAt = new Date('2024-01-01');
      const exec = new CommandExecution(
        'id-1',
        'SomeCommand',
        'corr-abc',
        CommandExecutionStatus.PENDING,
        null,
        createdAt,
      );
      expect(exec.id).toBe('id-1');
      expect(exec.commandName).toBe('SomeCommand');
      expect(exec.correlationId).toBe('corr-abc');
      expect(exec.createdAt).toBe(createdAt);
      expect(exec.startedAt).toBeNull();
      expect(exec.completedAt).toBeNull();
      expect(exec.errorMessage).toBeNull();
    });

    it('should allow null correlationId', () => {
      const exec = new CommandExecution('id-1', 'SomeCommand', null);
      expect(exec.correlationId).toBeNull();
    });
  });

  describe('markRunning()', () => {
    it('should transition PENDING → RUNNING and set startedAt', () => {
      const before = new Date();
      const exec = makeExecution();
      exec.markRunning();
      const after = new Date();

      expect(exec.status).toBe(CommandExecutionStatus.RUNNING);
      expect(exec.startedAt).not.toBeNull();
      expect(exec.startedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(exec.startedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should throw when called from RUNNING', () => {
      const exec = makeExecution(CommandExecutionStatus.RUNNING);
      expect(() => exec.markRunning()).toThrow(/Cannot transition to RUNNING from RUNNING/);
    });

    it('should throw when called from COMPLETED', () => {
      const exec = makeExecution(CommandExecutionStatus.COMPLETED);
      expect(() => exec.markRunning()).toThrow(/Cannot transition to RUNNING from COMPLETED/);
    });

    it('should throw when called from FAILED', () => {
      const exec = makeExecution(CommandExecutionStatus.FAILED);
      expect(() => exec.markRunning()).toThrow(/Cannot transition to RUNNING from FAILED/);
    });
  });

  describe('markCompleted()', () => {
    it('should transition RUNNING → COMPLETED and set completedAt', () => {
      const exec = makeExecution(CommandExecutionStatus.RUNNING);
      const before = new Date();
      exec.markCompleted();
      const after = new Date();

      expect(exec.status).toBe(CommandExecutionStatus.COMPLETED);
      expect(exec.completedAt).not.toBeNull();
      expect(exec.completedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(exec.completedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should throw when called from PENDING', () => {
      const exec = makeExecution(CommandExecutionStatus.PENDING);
      expect(() => exec.markCompleted()).toThrow(/Cannot transition to COMPLETED from PENDING/);
    });

    it('should throw when called from FAILED', () => {
      const exec = makeExecution(CommandExecutionStatus.FAILED);
      expect(() => exec.markCompleted()).toThrow(/Cannot transition to COMPLETED from FAILED/);
    });

    it('should throw when called from COMPLETED', () => {
      const exec = makeExecution(CommandExecutionStatus.COMPLETED);
      expect(() => exec.markCompleted()).toThrow(/Cannot transition to COMPLETED from COMPLETED/);
    });
  });

  describe('markFailed()', () => {
    it('should transition RUNNING → FAILED and set errorMessage and completedAt', () => {
      const exec = makeExecution(CommandExecutionStatus.RUNNING);
      const before = new Date();
      exec.markFailed('Something went wrong');
      const after = new Date();

      expect(exec.status).toBe(CommandExecutionStatus.FAILED);
      expect(exec.errorMessage).toBe('Something went wrong');
      expect(exec.completedAt).not.toBeNull();
      expect(exec.completedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(exec.completedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should transition PENDING → FAILED directly', () => {
      const exec = makeExecution(CommandExecutionStatus.PENDING);
      exec.markFailed('Early failure');

      expect(exec.status).toBe(CommandExecutionStatus.FAILED);
      expect(exec.errorMessage).toBe('Early failure');
      expect(exec.completedAt).not.toBeNull();
    });

    it('should throw when called from COMPLETED', () => {
      const exec = makeExecution(CommandExecutionStatus.COMPLETED);
      expect(() => exec.markFailed('err')).toThrow(/Cannot transition to FAILED from COMPLETED/);
    });

    it('should throw when called from FAILED', () => {
      const exec = makeExecution(CommandExecutionStatus.FAILED);
      expect(() => exec.markFailed('err')).toThrow(/Cannot transition to FAILED from FAILED/);
    });
  });

  describe('full lifecycle', () => {
    it('should complete successfully: PENDING → RUNNING → COMPLETED', () => {
      const exec = makeExecution();
      exec.markRunning();
      exec.markCompleted();

      expect(exec.status).toBe(CommandExecutionStatus.COMPLETED);
      expect(exec.startedAt).not.toBeNull();
      expect(exec.completedAt).not.toBeNull();
      expect(exec.errorMessage).toBeNull();
    });

    it('should fail after starting: PENDING → RUNNING → FAILED', () => {
      const exec = makeExecution();
      exec.markRunning();
      exec.markFailed('Fatal error');

      expect(exec.status).toBe(CommandExecutionStatus.FAILED);
      expect(exec.startedAt).not.toBeNull();
      expect(exec.completedAt).not.toBeNull();
      expect(exec.errorMessage).toBe('Fatal error');
    });
  });
});
