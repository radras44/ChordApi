import { Test, TestingModule } from '@nestjs/testing';
import { VoicingService } from './voicing.service';

describe('VoicingService', () => {
  let service: VoicingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoicingService],
    }).compile();

    service = module.get<VoicingService>(VoicingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
